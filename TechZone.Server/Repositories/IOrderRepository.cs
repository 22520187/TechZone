using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.GET;

namespace TechZone.Server.Repositories
{
    public interface IOrderRepository : ITechZoneRepository<Order>
    {
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<List<Order>> GetOrdersByUserIdAsync(int userId);

        Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus);
    }
}