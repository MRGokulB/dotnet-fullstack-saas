using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Common.Interfaces;
using DotnetFullstackSaaS.Application.Features.Analytics.Dtos;
using DotnetFullstackSaaS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DotnetFullstackSaaS.Application.Features.Analytics.Queries;

public record GetAnalyticsSummaryQuery : IQuery<AnalyticsSummaryResponse>;

public sealed class GetAnalyticsSummaryQueryHandler : IQueryHandler<GetAnalyticsSummaryQuery, AnalyticsSummaryResponse>
{
    private readonly IApplicationDbContext _dbContext;

    public GetAnalyticsSummaryQueryHandler(IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AnalyticsSummaryResponse> HandleAsync(
        GetAnalyticsSummaryQuery query,
        CancellationToken cancellationToken = default)
    {
        var orders = await _dbContext.Orders
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalOrders = orders.Count;
        var paidOrdersList = orders.Where(o => o.Status == OrderStatus.Paid).ToList();
        var paidCount = paidOrdersList.Count;
        var pendingCount = orders.Count(o => o.Status == OrderStatus.Pending);
        var failedCount = orders.Count(o => o.Status == OrderStatus.Failed || o.Status == OrderStatus.Cancelled || o.Status == OrderStatus.Refunded);

        var totalRevenue = paidOrdersList.Sum(o => o.TotalAmount);
        var conversionRate = totalOrders > 0 ? Math.Round((double)paidCount / totalOrders * 100, 1) : 0.0;
        var avgOrderValue = paidCount > 0 ? Math.Round(totalRevenue / paidCount, 2) : 0m;

        var last7Days = Enumerable.Range(0, 7)
            .Select(i => DateTime.UtcNow.Date.AddDays(-6 + i))
            .ToList();

        var dailyTrend = last7Days.Select(date =>
        {
            var dayOrders = paidOrdersList.Where(o => o.CreatedAtUtc.Date == date).ToList();
            return new RecentOrderTrendDto(
                date.ToString("yyyy-MM-dd"),
                dayOrders.Sum(o => o.TotalAmount),
                dayOrders.Count
            );
        }).ToList();

        return new AnalyticsSummaryResponse(
            totalRevenue,
            totalOrders,
            paidCount,
            pendingCount,
            failedCount,
            conversionRate,
            avgOrderValue,
            dailyTrend
        );
    }
}
