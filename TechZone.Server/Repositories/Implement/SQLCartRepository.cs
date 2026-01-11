using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLCartRepository : TechZoneRepository<Cart>, ICartRepository
    {
        public SQLCartRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<bool> ClearCustomerCart(int userId)
        {
            var cart = await dbContext.Carts
                .FirstOrDefaultAsync(x => x.UserId == Convert.ToInt32(userId));

            var cartDetails = await dbContext.CartDetails.Where(cd => cd.CartId == cart.CartId).ToListAsync();

            if (!cartDetails.Any()) return false;

            dbContext.CartDetails.RemoveRange(cartDetails);
            await dbContext.SaveChangesAsync();
            return true;

        }

        public async Task<Cart> GetCartByCustomerId(string userId)
        {
            var cart = await dbContext.Carts
                .FirstOrDefaultAsync(x => x.UserId == Convert.ToInt32(userId));



            return cart;
        }

    }
}