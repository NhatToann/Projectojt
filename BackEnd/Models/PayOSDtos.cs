namespace PetShop.Models;

public sealed record CreatePayOSPaymentRequest(
    int OrderCode,
    decimal Amount,
    string Description,
    string ReturnUrl,
    string CancelUrl
);

public sealed record PayOSCheckoutResult(string CheckoutUrl, int OrderCode, decimal Amount, string Description);

public sealed record PayOSWebhookResult(bool Success, string Message);

public sealed record PayOSWebhookPayload(string? Code, PayOSWebhookData? Data);

public sealed record PayOSWebhookData(int OrderCode, string? Status);
