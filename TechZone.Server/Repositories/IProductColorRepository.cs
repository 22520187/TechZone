using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IProductColorRepository : ITechZoneRepository<ProductColor>
    {
        Task AddProductColorsAsync(List<ProductColor> productColors);

        Task<List<ProductColor>> GetProductColorsByProductIdAsync(int productId);
    }
}