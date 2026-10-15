using System.Threading;
using System.Threading.Tasks;

namespace DotnetFullstackSaaS.Application.Common.CQRS;

public interface ICommand<TResponse>
{
}

public interface ICommandHandler<in TCommand, TResponse>
    where TCommand : ICommand<TResponse>
{
    Task<TResponse> HandleAsync(TCommand command, CancellationToken cancellationToken = default);
}
