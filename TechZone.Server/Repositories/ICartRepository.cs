using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface ICartRepository : ITechZoneRepository<Cart>
    {
        Task<Cart> GetCartByCustomerId(string userId);
        Task<bool> ClearCustomerCart(int userId);
    }
}