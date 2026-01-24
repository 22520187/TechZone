namespace TechZone.Server.Services.Models;

public static class ChatbotKnowledgeModels
{
    public static string Normalize(string s)
        => (s ?? string.Empty).Trim().ToLowerInvariant();
}

public class ChatbotAnswer
{
    public string TextResponse { get; set; } = string.Empty;
    public List<ProductInfo>? Products { get; set; }
}

public class ProductInfo
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public int? StockQuantity { get; set; }
}


