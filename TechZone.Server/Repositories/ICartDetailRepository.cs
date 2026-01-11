using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface ICartDetailRepository : ITechZoneRepository<CartDetail>
    {
        // Get Cart Details by Cart ID
        Task<List<CartDetail>> GetLongCartDetailByCartId(int cartId);

        Task<List<CartDetail>> GetShortCartDetailByCartId(int cartId);

        // Delete Cart Detail by Cart Detail ID
        Task<bool> DeleteCartDetailByCartId(int cartDetailId);
    }
}