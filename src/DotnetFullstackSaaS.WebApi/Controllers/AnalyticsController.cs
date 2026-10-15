using System.Threading;
using System.Threading.Tasks;
using DotnetFullstackSaaS.Application.Common.CQRS;
using DotnetFullstackSaaS.Application.Features.Analytics.Dtos;
using DotnetFullstackSaaS.Application.Features.Analytics.Queries;
using Microsoft.AspNetCore.Mvc;

namespace DotnetFullstackSaaS.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IDispatcher _dispatcher;

    public AnalyticsController(IDispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<AnalyticsSummaryResponse>> GetSummary(CancellationToken cancellationToken)
    {
        var response = await _dispatcher.QueryAsync<GetAnalyticsSummaryQuery, AnalyticsSummaryResponse>(
            new GetAnalyticsSummaryQuery(), cancellationToken);
        return Ok(response);
    }
}
