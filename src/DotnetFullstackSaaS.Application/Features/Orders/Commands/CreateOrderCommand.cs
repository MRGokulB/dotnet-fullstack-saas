using System;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Orders.Dtos;
using DotnetFullstackSaaS.Domain.Entities;

namespace DotnetFullstackSaaS.Application.Features.Orders.Commands;

public record CreateOrderCommand(
    string CustomerEmail,
    string ProductName,
    decimal TotalAmount,
    string Currency) : ICommand<OrderResponse>;

public sealed class CreateOrderCommandHandler : ICommandHandler<CreateOrderCommand, OrderResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public CreateOrderCommandHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OrderResponse> HandleAsync(
        CreateOrderCommand command,
        CancellationToken cancellationToken = default)
    {
        var order = Order.Create(
            command.CustomerEmail,
            command.ProductName,
            command.TotalAmount,
            command.Currency);

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return OrderResponse.FromEntity(order);
    }
}
