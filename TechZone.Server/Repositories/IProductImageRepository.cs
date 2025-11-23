using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IProductImageRepository : ITechZoneRepository<ProductImage>
    {
        Task AddProductImagesAsync(List<ProductImage> productImages);

        Task<List<ProductImage>> GetProductImagesByProductIdAsync(int productId);
    }
}