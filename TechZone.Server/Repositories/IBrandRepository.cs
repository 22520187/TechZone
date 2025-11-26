using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IBrandRepository : ITechZoneRepository<Brand>
    {
        Task<List<Brand>> AdminGetAllBrandAsync();
        Task<Brand> AddBrandAsync(Brand brand);
        Task<Brand> DeleteBrandAsync(int brandId);
        Task<Brand?> UpdateBrandAsync(int brandId, Brand updatedBrand);
    }
}