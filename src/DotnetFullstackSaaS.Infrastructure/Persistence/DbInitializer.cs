using DotnetFullstackSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Products.AnyAsync())
        {
            var starter = Product.Create(
                "starter",
                "Developer Starter",
                "Lightweight single-instance infrastructure for microservices, prototypes, and testing.",
                29m,
                290m,
                "[\"Single-tenant instance\",\"SQLite / Postgres support\",\"Up to 10k requests/mo\",\"Community Support\"]",
                false,
                "Fast Track"
            );
            var pro = Product.Create(
                "pro",
                "Cloud Scale Pro",
                "High-throughput enterprise pipeline with automated CI/CD and managed cloud database.",
                99m,
                990m,
                "[\"High-throughput Kestrel API\",\"Azure SQL / Neon Postgres\",\"Automated CI/CD Pipeline\",\"Stripe Webhooks & Idempotency\"]",
                true,
                "Most Popular"
            );
            var ent = Product.Create(
                "enterprise",
                "Enterprise Agentic",
                "Full 4-layer Clean Architecture with distributed tracing, zero-downtime scaling, and 24/7 SLA.",
                299m,
                2990m,
                "[\"Clean Architecture 4-Layer\",\"Azure Container Apps / ECS\",\"Full Observability & Metrics\",\"24/7 Dedicated Support\"]",
                false,
                "Enterprise"
            );
            await context.Products.AddRangeAsync(starter, pro, ent);
            await context.SaveChangesAsync();
        }

        if (await context.Orders.AnyAsync())
        {
            return;
        }

        var order1 = Order.Create("developer@google.com", "Cloud Scale Pro (monthly)", 99.00m, "usd");
        order1.AttachStripeSession("cs_live_sample_session_101");
        order1.MarkAsPaid("pi_3MtwxRLkdIwHu7ix28a3tKZX");

        var order2 = Order.Create("architect@microsoft.com", "Enterprise Agentic (annual)", 2990.00m, "usd");
        order2.AttachStripeSession("cs_live_sample_session_202");
        order2.MarkAsPaid("pi_3Mtwy2LkdIwHu7ix19b4uABZ");

        var order3 = Order.Create("sarah.dev@netflix.com", "Cloud Scale Pro (annual)", 990.00m, "usd");
        order3.AttachStripeSession("cs_live_sample_session_303");
        order3.MarkAsPaid("pi_3Mtwz9LkdIwHu7ix77c5vPQM");

        var order4 = Order.Create("alex@startup.io", "Developer Starter (monthly)", 29.00m, "usd");
        order4.AttachStripeSession("cs_pending_sample_session_404");

        await context.Orders.AddRangeAsync(order1, order2, order3, order4);
        await context.SaveChangesAsync();
    }
}
