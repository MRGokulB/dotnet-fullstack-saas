using System;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Payments.Dtos;
using DotnetFullstackSaaS.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Features.Payments.Commands;

public record SimulatePaymentSuccessCommand(Guid OrderId) : ICommand<SimulatePaymentSuccessResponse>;

public sealed class SimulatePaymentSuccessCommandHandler : ICommandHandler<SimulatePaymentSuccessCommand, SimulatePaymentSuccessResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public SimulatePaymentSuccessCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SimulatePaymentSuccessResponse> HandleAsync(
        SimulatePaymentSuccessCommand command,
        CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == command.OrderId, cancellationToken);
        if (order == null)
        {
            throw new DomainRuleViolationException($"Order with ID {command.OrderId} was not found.");
        }

        var mockPaymentIntent = "pi_simulated_" + Guid.NewGuid().ToString("N")[..16];
        order.MarkAsPaid(mockPaymentIntent);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SimulatePaymentSuccessResponse(
            "Simulated webhook event processed successfully",
            order.Id,
            order.Status.ToString(),
            mockPaymentIntent
        );
    }
}
