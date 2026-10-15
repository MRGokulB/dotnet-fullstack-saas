using DotnetFullstackSaaS.Domain.Common;
using DotnetFullstackSaaS.Domain.Enums;
using DotnetFullstackSaaS.Domain.Events;
using DotnetFullstackSaaS.Domain.Exceptions;

namespace DotnetFullstackSaaS.Domain.Entities;

public class Order : BaseEntity
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
        if (Status == OrderStatus.Paid)
        {
            throw new DomainRuleViolationException("Order is already paid.");
        }
        if (Status == OrderStatus.Cancelled || Status == OrderStatus.Refunded)
        {
            throw new DomainRuleViolationException($"Cannot pay an order with status {Status}.");
        }

        var previousStatus = Status;
        Status = OrderStatus.Paid;
        StripePaymentIntentId = paymentIntentId;
        PaidAtUtc = DateTime.UtcNow;

        RaiseDomainEvent(new OrderStatusChangedDomainEvent(
            Guid.NewGuid(),
            Id,
            previousStatus,
            Status,
            DateTime.UtcNow));
    }

    public void MarkAsFailed()
    {
        if (Status == OrderStatus.Paid)
        {
            throw new DomainRuleViolationException("Cannot mark a paid order as failed.");
        }

        var previousStatus = Status;
        Status = OrderStatus.Failed;

        RaiseDomainEvent(new OrderStatusChangedDomainEvent(
            Guid.NewGuid(),
            Id,
            previousStatus,
            Status,
            DateTime.UtcNow));
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Paid)
        {
            throw new DomainRuleViolationException("Cannot cancel a paid order. Use Refund instead.");
        }

        var previousStatus = Status;
        Status = OrderStatus.Cancelled;

        RaiseDomainEvent(new OrderStatusChangedDomainEvent(
            Guid.NewGuid(),
            Id,
            previousStatus,
            Status,
            DateTime.UtcNow));
    }

    public void Refund()
    {
        if (Status != OrderStatus.Paid)
        {
            throw new DomainRuleViolationException("Only paid orders can be refunded.");
        }

        var previousStatus = Status;
        Status = OrderStatus.Refunded;

        RaiseDomainEvent(new OrderStatusChangedDomainEvent(
            Guid.NewGuid(),
            Id,
            previousStatus,
            Status,
            DateTime.UtcNow));
    }
}
