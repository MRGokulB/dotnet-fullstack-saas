using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Payments.Commands;
using DotnetFullstackSaaS.Application.Features.Payments.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Stripe;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IDispatcher _dispatcher;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IDispatcher dispatcher,
        IPaymentService paymentService,
        ILogger<PaymentsController> logger)
    {
        _dispatcher = dispatcher;
        _paymentService = paymentService;
        _logger = logger;
    }

    [HttpPost("checkout/{orderId:guid}")]
    public async Task<ActionResult<CheckoutResponse>> CreateCheckoutSession(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        var response = await _dispatcher.SendAsync<CreateCheckoutSessionCommand, CheckoutResponse>(
            new CreateCheckoutSessionCommand(orderId), cancellationToken);

        return Ok(response);
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
    public async Task<ActionResult<SimulatePaymentSuccessResponse>> SimulateSuccess(
        Guid orderId,
        CancellationToken cancellationToken)
    {
        var response = await _dispatcher.SendAsync<SimulatePaymentSuccessCommand, SimulatePaymentSuccessResponse>(
            new SimulatePaymentSuccessCommand(orderId), cancellationToken);

        return Ok(response);
    }
}
