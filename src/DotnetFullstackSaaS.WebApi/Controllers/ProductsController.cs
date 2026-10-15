using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Features.Products.Dtos;
using DotnetFullstackSaaS.Application.Features.Products.Queries;
using Microsoft.AspNetCore.Mvc;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IDispatcher _dispatcher;

    public ProductsController(IDispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponse>>> GetProducts(CancellationToken cancellationToken)
    {
        var response = await _dispatcher.QueryAsync<GetProductsQuery, IEnumerable<ProductResponse>>(
            new GetProductsQuery(), cancellationToken);
        return Ok(response);
    }
}
