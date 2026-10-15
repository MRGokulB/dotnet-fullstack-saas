using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Products.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IApplicationDbContext _dbContext;

    public ProductsController(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProducts(CancellationToken cancellationToken)
    {
        var products = await _dbContext.Products
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(products.Select(ProductResponse.FromEntity));
    }
}
