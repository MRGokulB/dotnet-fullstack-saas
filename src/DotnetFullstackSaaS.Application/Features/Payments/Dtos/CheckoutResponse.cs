namespace DotnetFullstackSaaS.Application.Features.Payments.Dtos;

public record CheckoutResponse(
    Guid OrderId,
    string SessionId,
    string CheckoutUrl
);
