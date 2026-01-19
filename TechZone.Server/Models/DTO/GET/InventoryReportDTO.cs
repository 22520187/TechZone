namespace TechZone.Server.Models.DTO.GET
{
    public class InventoryReportDTO
    {
        public int TotalProducts { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public List<ProductStockDTO> ProductStocks { get; set; } = new List<ProductStockDTO>();
    }

    public class ProductStockDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public string? CategoryName { get; set; }
        public string? BrandName { get; set; }
        public decimal Price { get; set; }
        public int TotalStock { get; set; }
        public List<ColorStockDTO> ColorStocks { get; set; } = new List<ColorStockDTO>();
        public string StockStatus { get; set; } = null!; // "In Stock", "Low Stock", "Out of Stock"
    }

    public class ColorStockDTO
    {
        public int ProductColorId { get; set; }
        public string Color { get; set; } = null!;
        public string ColorCode { get; set; } = null!;
        public int StockQuantity { get; set; }
    }
}
