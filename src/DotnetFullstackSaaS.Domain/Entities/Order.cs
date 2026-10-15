using DotnetFullstackSaaS.Domain.Enums;

namespace DotnetFullstackSaaS.Domain.Entities;

public class Order
{
    public Guid Id { get; private set; }
    public string CustomerEmail { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public decimal TotalAmount { get; private set; }
    public string Currency { get; private set; } = "usd";
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public string? StripePaymentIntentId { get; private set; }
    public string? StripeSessionId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? PaidAtUtc { get; private set; }

    private Order() { }

    public static Order Create(string customerEmail, string productName, decimal totalAmount, string currency)
    {
        return new Order
        {
            Id = Guid.NewGuid(),
            CustomerEmail = customerEmail,
            ProductName = productName,
            TotalAmount = totalAmount,
            Currency = currency.ToLowerInvariant(),
            Status = OrderStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };
    }

    public void AttachStripeSession(string sessionId)
    {
        StripeSessionId = sessionId;
    }

    public void MarkAsPaid(string paymentIntentId)
    {
        Status = OrderStatus.Paid;
        StripePaymentIntentId = paymentIntentId;
        PaidAtUtc = DateTime.UtcNow;
    }

    public void MarkAsFailed()
    {
        Status = OrderStatus.Failed;
    }

    public void Cancel()
    {
        Status = OrderStatus.Cancelled;
    }
}
