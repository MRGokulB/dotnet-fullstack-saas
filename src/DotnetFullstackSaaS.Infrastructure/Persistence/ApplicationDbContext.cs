using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Ignore(o => o.DomainEvents);
            entity.Property(o => o.CustomerEmail).IsRequired().HasMaxLength(256);
            entity.Property(o => o.ProductName).IsRequired().HasMaxLength(200);
            entity.Property(o => o.TotalAmount).HasPrecision(18, 2);
            entity.Property(o => o.Currency).IsRequired().HasMaxLength(10);
            entity.Property(o => o.Status).HasConversion<string>().HasMaxLength(50);
            entity.HasIndex(o => o.StripePaymentIntentId).IsUnique();
            entity.HasIndex(o => o.StripeSessionId).IsUnique();
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Role).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(150);
            entity.Property(p => p.Description).IsRequired().HasMaxLength(500);
            entity.Property(p => p.MonthlyPrice).HasPrecision(18, 2);
            entity.Property(p => p.AnnualPrice).HasPrecision(18, 2);
            entity.Property(p => p.Badge).HasMaxLength(50);

            entity.HasData(
                Product.Create(
                    "starter",
                    "Developer Starter",
                    "Lightweight single-instance infrastructure for microservices, prototypes, and testing.",
                    29m,
                    290m,
                    "[\"Single-tenant instance\",\"SQLite / Postgres support\",\"Up to 10k requests/mo\",\"Community Support\"]",
                    false,
                    "Fast Track"
                ),
                Product.Create(
                    "pro",
                    "Cloud Scale Pro",
                    "High-throughput enterprise pipeline with automated CI/CD and managed cloud database.",
                    99m,
                    990m,
                    "[\"High-throughput Kestrel API\",\"Azure SQL / Neon Postgres\",\"Automated CI/CD Pipeline\",\"Stripe Webhooks & Idempotency\"]",
                    true,
                    "Most Popular"
                ),
                Product.Create(
                    "enterprise",
                    "Enterprise Agentic",
                    "Full 4-layer Clean Architecture with distributed tracing, zero-downtime scaling, and 24/7 SLA.",
                    299m,
                    2990m,
                    "[\"Clean Architecture 4-Layer\",\"Azure Container Apps / ECS\",\"Full Observability & Metrics\",\"24/7 Dedicated Support\"]",
                    false,
                    "Enterprise"
                )
            );
        });
    }
}
