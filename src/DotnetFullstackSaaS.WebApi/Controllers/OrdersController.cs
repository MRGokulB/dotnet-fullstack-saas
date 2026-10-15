using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Orders.Dtos;
using DotnetFullstackSaaS.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IValidator<CreateOrderRequest> _validator;

    public OrdersController(
        IApplicationDbContext dbContext,
        IValidator<CreateOrderRequest> validator)
    {
        _dbContext = dbContext;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders(CancellationToken cancellationToken)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => OrderResponse.FromEntity(o))
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null)
        {
            return NotFound();
        }

        return Ok(OrderResponse.FromEntity(order));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var order = Order.Create(
            request.CustomerEmail,
            request.ProductName,
            request.TotalAmount,
            request.Currency);

        _dbContext.Orders.Add(order);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = OrderResponse.FromEntity(order);
        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, response);
    }
}
