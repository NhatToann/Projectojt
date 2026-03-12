using PetShop.Models;

namespace PetShop.Interfaces;

public interface IPayOSService
{
    Task<PayOSCheckoutResult?> CreatePaymentLinkAsync(CreatePayOSPaymentRequest request, CancellationToken ct = default);
    bool VerifyWebhook(string rawData, string? signature);
    Task<PayOSWebhookResult> HandleWebhookAsync(string rawData, CancellationToken ct = default);
    string NormalizeDescription(string text);
    string? GetLastError();
    string? GetLastResponse();
}
