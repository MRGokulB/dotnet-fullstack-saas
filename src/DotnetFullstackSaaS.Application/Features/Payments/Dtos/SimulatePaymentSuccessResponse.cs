using System;

namespace DotnetFullstackSaaS.Application.Features.Payments.Dtos;

public record SimulatePaymentSuccessResponse(
    string Message,
    Guid OrderId,
    string Status,
    string PaymentIntentId
);
