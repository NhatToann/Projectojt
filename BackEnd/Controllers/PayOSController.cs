using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetShop.Data;
using PetShop.Interfaces;
using PetShop.Models;

namespace PetShop.Controllers;

[ApiController]
[Route("api/payos")]
public sealed class PayOSController : ControllerBase
{
    private readonly IPayOSService _payOS;
    private readonly ShopPetDatabaseContext _db;

    public PayOSController(IPayOSService payOS, ShopPetDatabaseContext db)
    {
        _payOS = payOS;
        _db = db;
    }

    [HttpPost("spa/create")]
    public async Task<ActionResult<PayOSCheckoutResult>> CreateSpaPayment([FromBody] CreateSpaPayOSRequest request, CancellationToken ct)
    {
        var booking = await _db.Bookings
            .AsNoTracking()
            .Include(b => b.BookingServices)
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, ct);

        if (booking is null)
        {
            return NotFound(new { message = "Booking không tồn tại." });
        }

        var amount = booking.BookingServices.Sum(bs => (bs.UnitPrice ?? 0m) * bs.Quantity);
        if (amount <= 0)
        {
            return BadRequest(new { message = "Booking không có tổng tiền." });
        }

        var orderCode = GenerateOrderCode(booking.BookingId);
        var description = _payOS.NormalizeDescription($"Thanh toan Spa #{booking.BookingId}");

        var payment = new Payment
        {
            PaymentType = "spa",
            ReferenceId = booking.BookingId,
            CustomerId = booking.CustomerId,
            Amount = amount,
            PaymentStatus = "pending",
            PaymentMethod = "PayOS",
            PayosOrderCode = orderCode,
            Note = description,
            CreatedAt = DateTime.Now
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        var checkout = await _payOS.CreatePaymentLinkAsync(new CreatePayOSPaymentRequest(
            orderCode,
            amount,
            description,
            request.ReturnUrl,
            request.CancelUrl
        ), ct);

        if (checkout is null)
        {
            return BadRequest(new
            {
                message = "Không tạo được link PayOS.",
                error = _payOS.GetLastError(),
                response = _payOS.GetLastResponse()
            });
        }

        return Ok(checkout);
    }

    [HttpPost("order/create")]
    public async Task<ActionResult<PayOSCheckoutResult>> CreateOrderPayment([FromBody] CreateOrderPayOSRequest request, CancellationToken ct)
    {
        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.OrderId == request.OrderId, ct);
        if (order is null)
        {
            return NotFound(new { message = "Order không tồn tại." });
        }

        if (order.TotalAmount <= 0)
        {
            return BadRequest(new { message = "Order không có tổng tiền." });
        }

        var orderCode = GenerateOrderCode(order.OrderId);
        var description = _payOS.NormalizeDescription($"Thanh toan don hang #{order.OrderId}");

        var payment = new Payment
        {
            PaymentType = "order",
            ReferenceId = order.OrderId,
            CustomerId = order.CustomerId ?? 0,
            Amount = order.TotalAmount,
            PaymentStatus = "pending",
            PaymentMethod = "PayOS",
            PayosOrderCode = orderCode,
            Note = description,
            CreatedAt = DateTime.Now
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        var checkout = await _payOS.CreatePaymentLinkAsync(new CreatePayOSPaymentRequest(
            orderCode,
            payment.Amount,
            description,
            request.ReturnUrl,
            request.CancelUrl
        ), ct);

        if (checkout is null)
        {
            return BadRequest(new
            {
                message = "Không tạo được link PayOS.",
                error = _payOS.GetLastError(),
                response = _payOS.GetLastResponse()
            });
        }

        return Ok(checkout);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] JsonElement payload, [FromHeader(Name = "x-payos-signature")] string? signature, CancellationToken ct)
    {
        var raw = payload.GetRawText();
        if (!_payOS.VerifyWebhook(raw, signature))
        {
            return Unauthorized(new { message = "Invalid signature" });
        }

        var result = await _payOS.HandleWebhookAsync(raw, ct);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message });
    }

    public sealed record CreateSpaPayOSRequest(int BookingId, string ReturnUrl, string CancelUrl);

    public sealed record CreateOrderPayOSRequest(int OrderId, string ReturnUrl, string CancelUrl);

    private static int GenerateOrderCode(int seed)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var code = (int)((timestamp % 1_000_000_000) * 1000 + (seed % 1000));
        return Math.Abs(code);
    }
}
