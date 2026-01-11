using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLCartDetailRepository : TechZoneRepository<CartDetail>, ICartDetailRepository
    {
        public SQLCartDetailRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<bool> DeleteCartDetailByCartId(int cartDetailId)
        {
            // Tạo filter dựa trên CartDetailId
            Expression<Func<CartDetail, bool>> filter = cd => cd.CartDetailId == cartDetailId;

            var status = await DeleteAsync(filter);

            if (status == null)
            {
                return false;
            }

            return true;
        }

        public async Task<List<CartDetail>> GetLongCartDetailByCartId(int cartId)
        {
            var cartDetails = await dbContext.CartDetails
            .Include(cd => cd.ProductColor)
                .ThenInclude(pc => pc.Product)
                    .ThenInclude(p => p.ProductImages)
            .Include(cd => cd.ProductColor)
                .ThenInclude(pc => pc.Product)
                    .ThenInclude(p => p.Promotions)
            .Where(cd => cd.CartId == cartId)
            .ToListAsync();
            return cartDetails;
        }

        public async Task<List<CartDetail>> GetShortCartDetailByCartId(int cartId)
        {
            var cartDetails = await dbContext.CartDetails
            .Where(cd => cd.CartId == cartId)
            .ToListAsync();
            return cartDetails;
        }
    }
}