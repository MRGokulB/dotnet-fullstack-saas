using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Infrastructure.Persistence;
using DotnetFullstackSaaS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stripe;

namespace DotnetFullstackSaaS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=app.db";
        var databaseProvider = configuration["DatabaseProvider"] ?? "Sqlite";

        if (databaseProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
        }
        else if (databaseProvider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
        }
        else
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        StripeConfiguration.ApiKey = configuration["Stripe:SecretKey"] ?? "sk_test_placeholder";
        services.AddScoped<IPaymentService, StripePaymentService>();

        return services;
    }
}
