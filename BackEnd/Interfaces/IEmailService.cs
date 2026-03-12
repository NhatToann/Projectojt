namespace PetShop.Interfaces;

public interface IEmailService
{
    Task SendOtpEmailAsync(string toEmail, string otp, CancellationToken ct = default);
    Task SendGoogleFirstLoginEmailAsync(string toEmail, string? name, CancellationToken ct = default);
    Task SendOrderInvoiceEmailAsync(
        string toEmail,
        string? customerName,
        string orderCode,
        IEnumerable<(string ItemName, int Quantity, decimal UnitPrice)> items,
        decimal totalAmount,
        CancellationToken ct = default);
}
