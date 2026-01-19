using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Models.DTO.ADD;

namespace TechZone.Server.Repositories
{
    public interface IProductRepository : ITechZoneRepository<Product>
    {
        Task<List<Product>> CustomerGetAllProductAsync();

        Task<Product> CustomerGetProductByIdAsync(int id);

        Task<List<Product>> AdminGetAllProductAsync();

        Task<Product> AdminGetProductByIdAsync(int id);

        Task<Product> AddProductAsync(Product product);

        Task<Product> DeleteProductAsync(int productId);

        Task<Product?> UpdateProductAsync(int productId, Product updatedProduct);

        Task<List<Product>> GetFeatureProductsAsync();

        Task<List<Product>> GetRecommendedProductsByOrderIdAsync(int orderId);
    }
}
