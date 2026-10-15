using System.Threading;
using System.Threading.Tasks;

namespace DotnetFullstackSaaS.Application.Common.CQRS;

public interface IQuery<TResponse>
{
}

public interface IQueryHandler<in TQuery, TResponse>
    where TQuery : IQuery<TResponse>
{
    Task<TResponse> HandleAsync(TQuery query, CancellationToken cancellationToken = default);
}
