using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Services;

public sealed class PayOSService : IPayOSService
{
    private readonly HttpClient _httpClient;
    private readonly PayOSOptions _options;
    private readonly ShopPetDatabaseContext _db;
    private string? _lastError;
    private string? _lastResponse;

    public PayOSService(HttpClient httpClient, IOptions<PayOSOptions> options, ShopPetDatabaseContext db)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _db = db;
    }

    public async Task<PayOSCheckoutResult?> CreatePaymentLinkAsync(CreatePayOSPaymentRequest request, CancellationToken ct = default)
    {
        _lastError = null;
        _lastResponse = null;

        var payload = BuildPaymentPayload(request);
        if (payload is null)
        {
            _lastError = "Invalid payload";
            return null;
        }

        var json = JsonSerializer.Serialize(payload, JsonSerializerOptionsFactory());
        var baseUri = _options.BaseUrl.EndsWith("/") ? _options.BaseUrl : _options.BaseUrl + "/";
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, new Uri(new Uri(baseUri), "payment-requests"));
        httpRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
        httpRequest.Headers.Add("x-client-id", _options.ClientId);
        httpRequest.Headers.Add("x-api-key", _options.ApiKey);

        try
        {
            using var response = await _httpClient.SendAsync(httpRequest, ct);
            var responseText = await response.Content.ReadAsStringAsync(ct);
            _lastResponse = responseText;

            if (!response.IsSuccessStatusCode)
            {
                _lastError = $"HTTP {(int)response.StatusCode}";
                return null;
            }

            var root = JsonSerializer.Deserialize<PayOSApiResponse>(responseText, JsonSerializerOptionsFactory());
            if (root?.Code is not ("00" or "200") || root.Data?.CheckoutUrl is null)
            {
                _lastError = root?.Desc ?? "Missing checkoutUrl";
                return null;
            }

            return new PayOSCheckoutResult(root.Data.CheckoutUrl, request.OrderCode, request.Amount, request.Description);
        }
        catch (HttpRequestException ex)
        {
            _lastError = ex.Message;
            if (_options.BaseUrl.Contains("api.payos.vn", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var fallback = "https://api.payos.vn/v2";
            var fallbackBase = fallback.EndsWith("/") ? fallback : fallback + "/";
            using var fallbackRequest = new HttpRequestMessage(HttpMethod.Post, new Uri(new Uri(fallbackBase), "payment-requests"));
            fallbackRequest.Content = new StringContent(json, Encoding.UTF8, "application/json");
            fallbackRequest.Headers.Add("x-client-id", _options.ClientId);
            fallbackRequest.Headers.Add("x-api-key", _options.ApiKey);

            using var response = await _httpClient.SendAsync(fallbackRequest, ct);
            var responseText = await response.Content.ReadAsStringAsync(ct);
            _lastResponse = responseText;

            if (!response.IsSuccessStatusCode)
            {
                _lastError = $"HTTP {(int)response.StatusCode}";
                return null;
            }

            var root = JsonSerializer.Deserialize<PayOSApiResponse>(responseText, JsonSerializerOptionsFactory());
            if (root?.Code is not ("00" or "200") || root.Data?.CheckoutUrl is null)
            {
                _lastError = root?.Desc ?? "Missing checkoutUrl";
                return null;
            }

            return new PayOSCheckoutResult(root.Data.CheckoutUrl, request.OrderCode, request.Amount, request.Description);
        }
    }

    public bool VerifyWebhook(string rawData, string? signature)
    {
        if (string.IsNullOrWhiteSpace(rawData) || string.IsNullOrWhiteSpace(signature))
        {
            return false;
        }

        var computed = ComputeHmac(rawData, _options.ChecksumKey);
        return string.Equals(computed, signature, StringComparison.OrdinalIgnoreCase);
    }

    public async Task<PayOSWebhookResult> HandleWebhookAsync(string rawData, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawData))
        {
            return new PayOSWebhookResult(false, "Empty payload");
        }

        PayOSWebhookPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<PayOSWebhookPayload>(rawData, JsonSerializerOptionsFactory());
        }
        catch
        {
            return new PayOSWebhookResult(false, "Invalid payload");
        }

        var data = payload?.Data;
        if (data is null)
        {
            return new PayOSWebhookResult(false, "Missing data");
        }

        var status = data.Status ?? payload?.Code;
        if (!string.Equals(status, "PAID", StringComparison.OrdinalIgnoreCase) && !string.Equals(status, "00", StringComparison.OrdinalIgnoreCase))
        {
            return new PayOSWebhookResult(true, "No action for status");
        }

        var payment = await _db.Payments.FirstOrDefaultAsync(p => p.PayosOrderCode == data.OrderCode, ct);
        if (payment is null)
        {
            return new PayOSWebhookResult(false, "Payment not found");
        }

        if (!string.Equals(payment.PaymentStatus, "pending", StringComparison.OrdinalIgnoreCase))
        {
            return new PayOSWebhookResult(true, "Already handled");
        }

        payment.PaymentStatus = "paid";
        payment.PaidAt = DateTime.Now;
        await _db.SaveChangesAsync(ct);

        if (string.Equals(payment.PaymentType, "spa", StringComparison.OrdinalIgnoreCase))
        {
            await UpdateSpaBookingStatusAsync(payment.ReferenceId, "Đã thanh toán", ct);
        }
        else if (string.Equals(payment.PaymentType, "order", StringComparison.OrdinalIgnoreCase))
        {
            await UpdateOrderStatusAsync(payment.ReferenceId, ct);
        }

        return new PayOSWebhookResult(true, "OK");
    }

    public string NormalizeDescription(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var step1 = text.Replace('đ', 'd').Replace('Đ', 'D');
        var normalized = step1.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        var cleaned = Regex.Replace(sb.ToString(), "[^a-zA-Z0-9 #]", string.Empty);
        cleaned = cleaned.Trim();
        if (cleaned.Length > 25)
        {
            cleaned = cleaned[..25].Trim();
        }

        return cleaned;
    }

    private PayOSPaymentRequest? BuildPaymentPayload(CreatePayOSPaymentRequest request)
    {
        if (request.Amount <= 0)
        {
            return null;
        }

        var amount = Convert.ToInt32(Math.Round(request.Amount));
        var description = NormalizeDescription(request.Description);

        var payload = new PayOSPaymentRequest
        {
            Amount = amount,
            CancelUrl = request.CancelUrl,
            Description = description,
            Items = Array.Empty<object>(),
            OrderCode = request.OrderCode,
            ReturnUrl = request.ReturnUrl
        };

        var signature = GenerateSignature(payload);
        if (string.IsNullOrWhiteSpace(signature))
        {
            return null;
        }

        payload.Signature = signature;
        return payload;
    }

    private string GenerateSignature(PayOSPaymentRequest payload)
    {
        var sorted = new SortedDictionary<string, string>
        {
            ["amount"] = payload.Amount.ToString(),
            ["cancelUrl"] = payload.CancelUrl,
            ["description"] = payload.Description,
            ["orderCode"] = payload.OrderCode.ToString(),
            ["returnUrl"] = payload.ReturnUrl
        };

        var data = string.Join("&", sorted.Select(kv => $"{kv.Key}={kv.Value}"));
        return ComputeHmac(data, _options.ChecksumKey);
    }

    private static string ComputeHmac(string data, string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return ConvertToHex(hash);
    }

    private static string ConvertToHex(byte[] hash)
    {
        var sb = new StringBuilder(hash.Length * 2);
        foreach (var b in hash)
        {
            sb.Append(b.ToString("x2"));
        }
        return sb.ToString();
    }

    private async Task UpdateSpaBookingStatusAsync(int? bookingId, string status, CancellationToken ct)
    {
        if (!bookingId.HasValue)
        {
            return;
        }

        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingId == bookingId.Value, ct);
        if (booking is null)
        {
            return;
        }

        booking.Status = status;
        booking.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync(ct);
    }

    private async Task UpdateOrderStatusAsync(int? orderId, CancellationToken ct)
    {
        if (!orderId.HasValue)
        {
            return;
        }

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId.Value, ct);
        if (order is null)
        {
            return;
        }

        order.PaymentStatus = "Đã thanh toán";
        if (!string.Equals(order.Status, "Hoàn thành", StringComparison.OrdinalIgnoreCase))
        {
            order.Status = "Chờ giao hàng";
        }
        order.PaidAt = DateTime.Now;
        await _db.SaveChangesAsync(ct);
    }

    private static JsonSerializerOptions JsonSerializerOptionsFactory()
    {
        return new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
    }

    public string? GetLastError() => _lastError;

    public string? GetLastResponse() => _lastResponse;

    private sealed class PayOSApiResponse
    {
        public string? Code { get; set; }
        public string? Desc { get; set; }
        public PayOSApiData? Data { get; set; }
    }

    private sealed class PayOSApiData
    {
        public string? CheckoutUrl { get; set; }
        public string? Status { get; set; }
    }

    private sealed class PayOSPaymentRequest
    {
        [JsonPropertyName("amount")]
        public int Amount { get; set; }

        [JsonPropertyName("cancelUrl")]
        public string CancelUrl { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("items")]
        public object[] Items { get; set; } = Array.Empty<object>();

        [JsonPropertyName("orderCode")]
        public int OrderCode { get; set; }

        [JsonPropertyName("returnUrl")]
        public string ReturnUrl { get; set; } = string.Empty;

        [JsonPropertyName("signature")]
        public string? Signature { get; set; }
    }
}
