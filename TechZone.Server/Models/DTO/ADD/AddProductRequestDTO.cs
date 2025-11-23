using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.GET;
namespace TechZone.Server.Models.DTO.ADD
{
    public class AddProductRequestDTO
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int? StockQuantity { get; set; }
        public virtual CategoryDTO? Category { get; set; }
        public ICollection<ProductImageDTO> ProductImages { get; set; } = new List<ProductImageDTO>();
        public ICollection<ProductColorDTO> ProductColors { get; set; } = new List<ProductColorDTO>();
    }
}