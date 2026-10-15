using System;
using DotnetFullstackSaaS.Domain.Common;
using DotnetFullstackSaaS.Domain.Enums;

namespace DotnetFullstackSaaS.Domain.Events;

public sealed record OrderStatusChangedDomainEvent(
    Guid EventId,
    Guid OrderId,
    OrderStatus PreviousStatus,
    OrderStatus NewStatus,
    DateTime OccurredOnUtc) : IDomainEvent;
