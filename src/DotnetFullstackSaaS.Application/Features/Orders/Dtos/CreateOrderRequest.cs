namespace DotnetFullstackSaaS.Application.Features.Orders.Dtos;

public record CreateOrderRequest(
    string CustomerEmail,
    string ProductName,
    decimal TotalAmount,
    string Currency
);
