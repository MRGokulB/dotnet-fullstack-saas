using DotnetFullstackSaaS.Domain.Entities;

namespace DotnetFullstackSaaS.Application.Features.Orders.Dtos;

public record OrderResponse(
    Guid Id,
    string CustomerEmail,
    string ProductName,
    decimal TotalAmount,
    string Currency,
    string Status,
    string? StripeSessionId,
    DateTime CreatedAtUtc,
    DateTime? PaidAtUtc
)
{
    public static OrderResponse FromEntity(Order order) =>
        new(
            order.Id,
            order.CustomerEmail,
            order.ProductName,
            order.TotalAmount,
            order.Currency,
            order.Status.ToString(),
            order.StripeSessionId,
            order.CreatedAtUtc,
            order.PaidAtUtc
        );
}
