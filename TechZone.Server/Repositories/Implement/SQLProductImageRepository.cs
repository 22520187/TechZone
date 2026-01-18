using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLProductImageRepository : TechZoneRepository<ProductImage>, IProductImageRepository
    {
        public SQLProductImageRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task AddProductImagesAsync(List<ProductImage> productImages)
        {
            dbContext.ProductImages.AddRange(productImages);
            await dbContext.SaveChangesAsync();
        }

        public async Task<List<ProductImage>> GetProductImagesByProductIdAsync(int productId)
        {
            return await dbContext.ProductImages.Where(pi => pi.ProductId == productId).ToListAsync();
        }

        public async Task DeleteProductImagesByProductIdAsync(int productId)
        {
            var images = await dbContext.ProductImages.Where(pi => pi.ProductId == productId).ToListAsync();
            dbContext.ProductImages.RemoveRange(images);
            await dbContext.SaveChangesAsync();
        }
    }
}