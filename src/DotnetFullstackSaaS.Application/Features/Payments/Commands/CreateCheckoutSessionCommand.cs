using System;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Payments.Dtos;
using DotnetFullstackSaaS.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Features.Payments.Commands;

public record CreateCheckoutSessionCommand(Guid OrderId, string? SuccessUrl = null, string? CancelUrl = null) : ICommand<CheckoutResponse>;

public sealed class CreateCheckoutSessionCommandHandler : ICommandHandler<CreateCheckoutSessionCommand, CheckoutResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPaymentService _paymentService;

    public CreateCheckoutSessionCommandHandler(
        IApplicationDbContext dbContext,
        IPaymentService paymentService)
    {
        _dbContext = dbContext;
        _paymentService = paymentService;
    }

    public async Task<CheckoutResponse> HandleAsync(
        CreateCheckoutSessionCommand command,
        CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == command.OrderId, cancellationToken);
        if (order == null)
        {
            throw new DomainRuleViolationException($"Order with ID {command.OrderId} was not found.");
        }

        var (sessionId, checkoutUrl) = await _paymentService.CreateCheckoutSessionAsync(
            order.Id,
            order.ProductName,
            order.TotalAmount,
            order.Currency,
            command.SuccessUrl ?? string.Empty,
            command.CancelUrl ?? string.Empty,
            cancellationToken);

        return new CheckoutResponse(order.Id, sessionId, checkoutUrl);
    }
}
