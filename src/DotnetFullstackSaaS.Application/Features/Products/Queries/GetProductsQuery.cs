using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Products.Dtos;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Features.Products.Queries;

public record GetProductsQuery : IQuery<IEnumerable<ProductResponse>>;

public sealed class GetProductsQueryHandler : IQueryHandler<GetProductsQuery, IEnumerable<ProductResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetProductsQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<ProductResponse>> HandleAsync(
        GetProductsQuery query,
        CancellationToken cancellationToken = default)
    {
        var products = await _dbContext.Products
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return products.Select(ProductResponse.FromEntity);
    }
}
