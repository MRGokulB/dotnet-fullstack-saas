using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Orders.Dtos;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Features.Orders.Queries;

public record GetOrdersQuery : IQuery<IEnumerable<OrderResponse>>;

public sealed class GetOrdersQueryHandler : IQueryHandler<GetOrdersQuery, IEnumerable<OrderResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetOrdersQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<OrderResponse>> HandleAsync(
        GetOrdersQuery query,
        CancellationToken cancellationToken = default)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return orders.Select(OrderResponse.FromEntity);
    }
}
