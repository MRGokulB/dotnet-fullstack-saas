namespace DotnetFullstackSaaS.Application.Features.Analytics.Dtos;

public record AnalyticsSummaryResponse(
    decimal TotalRevenue,
    int TotalOrders,
    int PaidOrders,
    int PendingOrders,
    int FailedOrders,
    double ConversionRatePercent,
    decimal AverageOrderValue,
    IEnumerable<RecentOrderTrendDto> DailyTrend
);

public record RecentOrderTrendDto(
    string Date,
    decimal Revenue,
    int OrdersCount
);
