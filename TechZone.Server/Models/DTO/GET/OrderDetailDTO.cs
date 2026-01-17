namespace TechZone.Server.Models.DTO.GET
{
    public class OrderDetailDTO
    {
        public int OrderDetailId { get; set; }
        public int? OrderId { get; set; }
        public int? ProductColorId { get; set; }

        public int Quantity { get; set; }
        public Decimal? Price { get; set; }

        // Include ProductColor with Product information (similar to CartItemDTO)
        public virtual OrderDetailProductColorDTO? ProductColor { get; set; }
    }

    public class OrderDetailProductColorDTO
    {
        public int ProductColorId { get; set; }
        public string Color { get; set; } = null!;
        public string ColorCode { get; set; } = null!;
        public int? StockQuantity { get; set; }
        public virtual CustomerProductDTO? Product { get; set; }
    }
}