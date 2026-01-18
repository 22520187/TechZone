namespace TechZone.Server.Models.DTO.GET
{
    public class ProductSalesDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string? ProductImage { get; set; }
        public string? CategoryName { get; set; }
        public string? BrandName { get; set; }
        public decimal Price { get; set; }
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalStock { get; set; }
    }

    public class TopProductsDTO
    {
        public List<ProductSalesDTO> BestSellers { get; set; } = new List<ProductSalesDTO>();
        public List<ProductSalesDTO> LeastSellers { get; set; } = new List<ProductSalesDTO>();
    }
}
