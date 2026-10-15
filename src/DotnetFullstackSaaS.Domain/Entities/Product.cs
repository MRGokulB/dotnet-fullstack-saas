namespace DotnetFullstackSaaS.Domain.Entities;

public class Product
{
    public string Id { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal MonthlyPrice { get; private set; }
    public decimal AnnualPrice { get; private set; }
    public string FeaturesJson { get; private set; } = "[]";
    public bool IsPopular { get; private set; }
    public string Badge { get; private set; } = string.Empty;

    private Product() { }

    public static Product Create(
        string id,
        string name,
        string description,
        decimal monthlyPrice,
        decimal annualPrice,
        string featuresJson,
        bool isPopular = false,
        string badge = "")
    {
        return new Product
        {
            Id = id,
            Name = name,
            Description = description,
            MonthlyPrice = monthlyPrice,
            AnnualPrice = annualPrice,
            FeaturesJson = featuresJson,
            IsPopular = isPopular,
            Badge = badge
        };
    }
}
