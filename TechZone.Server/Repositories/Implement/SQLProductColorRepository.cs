using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLProductColorRepository : TechZoneRepository<ProductColor>, IProductColorRepository
    {
        public SQLProductColorRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task AddProductColorsAsync(List<ProductColor> productColors)
        {
            dbContext.ProductColors.AddRange(productColors);
            await dbContext.SaveChangesAsync();
        }

        public async Task<List<ProductColor>> GetProductColorsByProductIdAsync(int productId)
        {
            return await dbContext.ProductColors.Where(pc => pc.ProductId == productId).ToListAsync();
        }

        public async Task DeleteProductColorsByProductIdAsync(int productId)
        {
            var colors = await dbContext.ProductColors.Where(pc => pc.ProductId == productId).ToListAsync();
            dbContext.ProductColors.RemoveRange(colors);
            await dbContext.SaveChangesAsync();
        }
    }
}