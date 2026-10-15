using System.Linq;
using System.Reflection;
using DotnetFullstackSaaS.Application.Common.CQRS;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace DotnetFullstackSaaS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<IDispatcher, Dispatcher>();

        var assembly = Assembly.GetExecutingAssembly();
        var types = assembly.GetTypes().Where(t => !t.IsAbstract && !t.IsInterface);

        foreach (var type in types)
        {
            var interfaces = type.GetInterfaces();
            foreach (var iface in interfaces)
            {
                if (iface.IsGenericType)
                {
                    var genericType = iface.GetGenericTypeDefinition();
                    if (genericType == typeof(ICommandHandler<,>) || genericType == typeof(IQueryHandler<,>))
                    {
                        services.AddScoped(iface, type);
                    }
                }
            }
        }

        return services;
    }
}
