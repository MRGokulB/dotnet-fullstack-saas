using System.Text.Json;
using DotnetFullstackSaaS.Domain.Entities;

namespace DotnetFullstackSaaS.Application.Features.Products.Dtos;

public record ProductResponse(
    string Id,
    string Name,
    string Description,
    decimal MonthlyPrice,
    decimal AnnualPrice,
    IEnumerable<string> Features,
    bool IsPopular,
    string Badge
)
{
    public static ProductResponse FromEntity(Product p)
    {
        IEnumerable<string> features;
        try
        {
            features = JsonSerializer.Deserialize<List<string>>(p.FeaturesJson) ?? new List<string>();
        }
        catch
        {
            features = new List<string>();
        }

        return new ProductResponse(
            p.Id,
            p.Name,
            p.Description,
            p.MonthlyPrice,
            p.AnnualPrice,
            features,
            p.IsPopular,
            p.Badge
        );
    }
}
