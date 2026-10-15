namespace DotnetFullstackSaaS.Application.Common.Interfaces;

public interface IPaymentService
{
    Task<(string SessionId, string CheckoutUrl)> CreateCheckoutSessionAsync(
        Guid orderId,
        string productName,
        decimal amount,
        string currency,
        string successUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default);

    Task<bool> HandleWebhookAsync(
        string jsonPayload,
        string signatureHeader,
        CancellationToken cancellationToken = default);
}
