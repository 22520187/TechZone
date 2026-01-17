using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IWarrantyRepository : ITechZoneRepository<Warranty>
    {
        Task<Warranty?> GetWarrantyByIdAsync(int warrantyId);
        Task<List<Warranty>> GetWarrantiesByUserIdAsync(int userId);
        Task<List<Warranty>> GetWarrantiesByOrderIdAsync(int orderId);
        Task<List<Warranty>> GetWarrantiesByOrderDetailIdAsync(int orderDetailId);
        Task<Warranty> CreateWarrantyForOrderDetailAsync(int orderDetailId, int? warrantyPeriodMonths = null);
        Task<List<Warranty>> CreateWarrantiesForOrderAsync(int orderId);
        Task<bool> UpdateWarrantyStatusAsync(int warrantyId, string status);
    }
}

