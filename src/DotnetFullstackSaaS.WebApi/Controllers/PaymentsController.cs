using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Payments.Dtos;
using DotnetFullstackSaaS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IApplicationDbContext dbContext,
        IPaymentService paymentService,
        IConfiguration configuration,
        ILogger<PaymentsController> logger)
    {
        _dbContext = dbContext;
        _paymentService = paymentService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("checkout/{orderId:guid}")]
    public async Task<ActionResult<CheckoutResponse>> CreateCheckoutSession(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        var successUrl = _configuration["Stripe:SuccessUrl"] ?? "http://localhost:5173/success?order_id=" + order.Id;
        var cancelUrl = _configuration["Stripe:CancelUrl"] ?? "http://localhost:5173/cancel?order_id=" + order.Id;

        var (sessionId, checkoutUrl) = await _paymentService.CreateCheckoutSessionAsync(
            order.Id,
            order.ProductName,
            order.TotalAmount,
            order.Currency,
            successUrl,
            cancelUrl,
            cancellationToken);

        return Ok(new CheckoutResponse(order.Id, sessionId, checkoutUrl));
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        string json;
        using (var reader = new StreamReader(HttpContext.Request.Body))
        {
            json = await reader.ReadToEndAsync(cancellationToken);
        }

        var signatureHeader = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            var processed = await _paymentService.HandleWebhookAsync(json, signatureHeader, cancellationToken);
            return Ok(new { received = true, processed });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe webhook signature validation failed");
            return BadRequest(new { message = "Invalid webhook signature" });
        }
    }

    [HttpPost("simulate-success/{orderId:guid}")]
    public async Task<IActionResult> SimulateSuccess(Guid orderId, CancellationToken cancellationToken)
    {
        var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        if (order.Status == OrderStatus.Paid)
        {
            return Ok(new { message = "Order is already paid", orderId = order.Id, status = "Paid" });
        }

        var mockPaymentIntent = "pi_simulated_" + Guid.NewGuid().ToString("N")[..16];
        order.MarkAsPaid(mockPaymentIntent);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new {
            message = "Simulated webhook event processed successfully",
            orderId = order.Id,
            status = "Paid",
            paymentIntentId = mockPaymentIntent
        });
    }
}
