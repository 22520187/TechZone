using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLOrderDetailRepository : TechZoneRepository<OrderDetail>, IOrderDetailRepository
    {
        public SQLOrderDetailRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        // Lấy tất cả chi tiết đơn hàng theo OrderId
        public async Task<List<OrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId)
        {
            return await dbContext.OrderDetails
                .Include(od => od.ProductColor)
                    .ThenInclude(pc => pc.Product)
                        .ThenInclude(p => p.Category)
                .Include(od => od.ProductColor)
                    .ThenInclude(pc => pc.Product)
                        .ThenInclude(p => p.Brand)
                .Include(od => od.ProductColor)
                    .ThenInclude(pc => pc.Product)
                        .ThenInclude(p => p.ProductImages)
                .Where(od => od.OrderId == orderId)
                .ToListAsync();
        }

        // Lấy chi tiết đơn hàng theo orderDetailId
        public async Task<OrderDetail> GetOrderDetailByIdAsync(int orderDetailId)
        {
            try
            {
                var orderDetail = await dbContext.OrderDetails
                    .Include(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Category)
                    .Include(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Brand)
                    .Include(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.ProductImages)
                    .FirstOrDefaultAsync(od => od.OrderDetailId == orderDetailId);

                if (orderDetail == null)
                {
                    throw new KeyNotFoundException($"Order Detail with ID {orderDetailId} not found.");
                }
                return orderDetail;
            }
            catch(Exception ex)
            {
                throw new Exception($"Error fetching OrderDetail by ID: {ex.Message}", ex);
            }
        }
    }
}