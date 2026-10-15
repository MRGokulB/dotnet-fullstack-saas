using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace DotnetFullstackSaaS.Infrastructure.Services;

public class StripePaymentService : IPaymentService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripePaymentService> _logger;

    public StripePaymentService(
        IApplicationDbContext dbContext,
        IConfiguration configuration,
        ILogger<StripePaymentService> logger)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(string SessionId, string CheckoutUrl)> CreateCheckoutSessionAsync(
        Guid orderId,
        string productName,
        decimal amount,
        string currency,
        string successUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default)
    {
        var secretKey = _configuration["Stripe:SecretKey"] ?? string.Empty;

        var effectiveSuccessUrl = !string.IsNullOrWhiteSpace(successUrl)
            ? successUrl
            : (_configuration["Stripe:SuccessUrl"] ?? "http://localhost:5173/success?order_id=" + orderId);

        var effectiveCancelUrl = !string.IsNullOrWhiteSpace(cancelUrl)
            ? cancelUrl
            : (_configuration["Stripe:CancelUrl"] ?? "http://localhost:5173/cancel?order_id=" + orderId);

        if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Contains("placeholder"))
        {
            var mockSessionId = "cs_sim_" + Guid.NewGuid().ToString("N")[..16];
            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
            if (order != null)
            {
                order.AttachStripeSession(mockSessionId);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            var simulatedRedirectUrl = effectiveSuccessUrl.Replace("{CHECKOUT_SESSION_ID}", mockSessionId);
            if (!simulatedRedirectUrl.Contains("order_id="))
            {
                simulatedRedirectUrl += (simulatedRedirectUrl.Contains('?') ? "&" : "?") + "order_id=" + orderId;
            }

            return (mockSessionId, simulatedRedirectUrl);
        }

        try
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(amount * 100),
                            Currency = currency.ToLowerInvariant(),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName
                            }
                        },
                        Quantity = 1
                    }
                },
                Mode = "payment",
                SuccessUrl = effectiveSuccessUrl,
                CancelUrl = effectiveCancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "OrderId", orderId.ToString() }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
            if (order != null)
            {
                order.AttachStripeSession(session.Id);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            return (session.Id, session.Url);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Stripe live session creation failed; falling back to simulated session");
            var mockSessionId = "cs_fallback_" + Guid.NewGuid().ToString("N")[..16];
            var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
            if (order != null)
            {
                order.AttachStripeSession(mockSessionId);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            var simulatedRedirectUrl = effectiveSuccessUrl.Replace("{CHECKOUT_SESSION_ID}", mockSessionId);
            if (!simulatedRedirectUrl.Contains("order_id="))
            {
                simulatedRedirectUrl += (simulatedRedirectUrl.Contains('?') ? "&" : "?") + "order_id=" + orderId;
            }

            return (mockSessionId, simulatedRedirectUrl);
        }
    }

    public async Task<bool> HandleWebhookAsync(
        string jsonPayload,
        string signatureHeader,
        CancellationToken cancellationToken = default)
    {
        var webhookSecret = _configuration["Stripe:WebhookSecret"] ?? string.Empty;
        var stripeEvent = EventUtility.ConstructEvent(jsonPayload, signatureHeader, webhookSecret);

        if (stripeEvent.Type == Events.CheckoutSessionCompleted)
        {
            if (stripeEvent.Data.Object is Session session &&
                session.Metadata != null &&
                session.Metadata.TryGetValue("OrderId", out var orderIdStr) &&
                Guid.TryParse(orderIdStr, out var orderId))
            {
                var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
                if (order != null && order.Status != OrderStatus.Paid)
                {
                    order.MarkAsPaid(session.PaymentIntentId ?? session.Id);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Order {OrderId} marked as paid via webhook", orderId);
                    return true;
                }
            }
        }
        else if (stripeEvent.Type == Events.PaymentIntentPaymentFailed)
        {
            if (stripeEvent.Data.Object is PaymentIntent paymentIntent &&
                paymentIntent.Metadata != null &&
                paymentIntent.Metadata.TryGetValue("OrderId", out var orderIdStr) &&
                Guid.TryParse(orderIdStr, out var orderId))
            {
                var order = await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);
                if (order != null)
                {
                    order.MarkAsFailed();
                    await _dbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogWarning("Order {OrderId} marked as failed via webhook", orderId);
                    return true;
                }
            }
        }

        return false;
    }
}
