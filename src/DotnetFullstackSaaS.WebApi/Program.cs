using System.Diagnostics;
using System.Text;
using DotnetFullstackSaaS.Application;
using DotnetFullstackSaaS.Infrastructure;
using DotnetFullstackSaaS.Infrastructure.Persistence;
using DotnetFullstackSaaS.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://*:5000");

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "super_secret_enterprise_jwt_key_that_is_at_least_32_bytes_long_12345";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "DotnetFullstackSaaS";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "DotnetFullstackSaaSClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "NexusCore SaaS API",
        Version = "v1",
        Description = "Enterprise-grade .NET Clean Architecture API with EF Core & Stripe Integration"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbInitializer.SeedAsync(dbContext);
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

var healthCheckHandler = async (ApplicationDbContext dbContext, IWebHostEnvironment env) =>
{
    var canConnect = false;
    try
    {
        canConnect = await dbContext.Database.CanConnectAsync();
    }
    catch
    {
        canConnect = false;
    }

    var currentProcess = Process.GetCurrentProcess();
    var uptime = DateTime.UtcNow - currentProcess.StartTime.ToUniversalTime();

    return Results.Ok(new
    {
        status = canConnect ? "Healthy" : "Degraded",
        databaseConnected = canConnect,
        uptime = $"{uptime.Hours:D2}h:{uptime.Minutes:D2}m:{uptime.Seconds:D2}s",
        memoryAllocatedMb = Math.Round((double)GC.GetTotalMemory(false) / (1024 * 1024), 2),
        runtimeVersion = Environment.Version.ToString(),
        environment = env.EnvironmentName,
        timestamp = DateTime.UtcNow
    });
};

app.MapGet("/health", healthCheckHandler);
app.MapGet("/api/health", healthCheckHandler);

app.MapControllers();

app.Run();
