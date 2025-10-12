using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IOrderDetailRepository : ITechZoneRepository<OrderDetail>
    {
        Task<OrderDetail> GetOrderDetailByIdAsync(int orderDetailId);
        Task<List<OrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId);
    }
}