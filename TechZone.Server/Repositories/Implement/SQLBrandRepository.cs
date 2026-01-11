using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLBrandRepository : TechZoneRepository<Brand>, IBrandRepository
    {
        public SQLBrandRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<Brand>> AdminGetAllBrandAsync()
        {
            return await dbContext.Brands
                .Include(b => b.Products)
                .ToListAsync();
        }

        public async Task<Brand> AddBrandAsync(Brand brand)
        {
            await dbContext.Brands.AddAsync(brand);
            await dbContext.SaveChangesAsync();
            return brand;
        }

        public async Task<Brand> DeleteBrandAsync(int brandId)
        {
            return await DeleteAsync(b => b.BrandId == brandId);
        }

        public async Task<Brand?> UpdateBrandAsync(int brandId, Brand updatedBrand)
        {
            var existingBrand = await dbContext.Brands.FirstOrDefaultAsync(b => b.BrandId == brandId);
            if (existingBrand == null)
            {
                return null;
            }
            existingBrand.BrandName = updatedBrand.BrandName;
            existingBrand.BrandImageUrl = updatedBrand.BrandImageUrl;
            
            await dbContext.SaveChangesAsync();
            return existingBrand;
        }
    }
}

