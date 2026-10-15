using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Features.Orders.Commands;
using DotnetFullstackSaaS.Application.Features.Orders.Dtos;
using DotnetFullstackSaaS.Application.Features.Orders.Queries;
using Microsoft.AspNetCore.Mvc;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IDispatcher _dispatcher;

    public OrdersController(IDispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetOrders(CancellationToken cancellationToken)
    {
        var orders = await _dispatcher.QueryAsync<GetOrdersQuery, IEnumerable<OrderResponse>>(
            new GetOrdersQuery(), cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _dispatcher.QueryAsync<GetOrderByIdQuery, OrderResponse?>(
            new GetOrderByIdQuery(id), cancellationToken);

        if (order == null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(
        [FromBody] CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var command = new CreateOrderCommand(
            request.CustomerEmail,
            request.ProductName,
            request.TotalAmount,
            request.Currency);

        var response = await _dispatcher.SendAsync<CreateOrderCommand, OrderResponse>(command, cancellationToken);
        return CreatedAtAction(nameof(GetOrderById), new { id = response.Id }, response);
    }
}
