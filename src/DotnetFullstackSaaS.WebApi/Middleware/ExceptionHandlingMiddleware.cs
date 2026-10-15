using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace DotnetFullstackSaaS.WebApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failure occurred");
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleGenericExceptionAsync(context, ex);
        }
    }

    private static Task HandleValidationExceptionAsync(HttpContext context, ValidationException exception)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

        var errors = exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        var problemDetails = new ValidationProblemDetails(errors)
        {
            Status = (int)HttpStatusCode.BadRequest,
            Title = "Validation Error",
            Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1"
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }

    private static Task HandleGenericExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var problemDetails = new ProblemDetails
        {
            Status = (int)HttpStatusCode.InternalServerError,
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred processing your request.",
            Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1"
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}
