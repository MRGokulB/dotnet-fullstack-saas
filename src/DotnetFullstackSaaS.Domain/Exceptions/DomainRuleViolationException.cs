using System;

namespace DotnetFullstackSaaS.Domain.Exceptions;

public sealed class DomainRuleViolationException : Exception
{
    public DomainRuleViolationException(string message) : base(message)
    {
    }
}
