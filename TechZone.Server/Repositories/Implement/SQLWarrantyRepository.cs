using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLWarrantyRepository : TechZoneRepository<Warranty>, IWarrantyRepository
    {
        private readonly TechZoneDbContext _context;

        public SQLWarrantyRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task<Warranty?> GetWarrantyByIdAsync(int warrantyId)
        {
            return await _context.Warranties
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Category)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Brand)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.ProductImages)
                .Include(w => w.Product)
                .Include(w => w.WarrantyClaims)
                    .ThenInclude(wc => wc.User)
                .FirstOrDefaultAsync(w => w.WarrantyId == warrantyId);
        }

        public async Task<List<Warranty>> GetWarrantiesByUserIdAsync(int userId)
        {
            return await _context.Warranties
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Category)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Brand)
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.ProductImages)
                .Include(w => w.Product)
                .Include(w => w.WarrantyClaims)
                .Where(w => w.OrderDetail != null && w.OrderDetail.Order != null && w.OrderDetail.Order.UserId == userId)
                .ToListAsync();
        }

        public async Task<List<Warranty>> GetWarrantiesByOrderIdAsync(int orderId)
        {
            return await _context.Warranties
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                .Include(w => w.Product)
                .Where(w => w.OrderDetail != null && w.OrderDetail.OrderId == orderId)
                .ToListAsync();
        }

        public async Task<List<Warranty>> GetWarrantiesByOrderDetailIdAsync(int orderDetailId)
        {
            return await _context.Warranties
                .Include(w => w.OrderDetail)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                .Include(w => w.Product)
                .Where(w => w.OrderDetailId == orderDetailId)
                .ToListAsync();
        }

        public async Task<Warranty> CreateWarrantyForOrderDetailAsync(int orderDetailId, int? warrantyPeriodMonths = null)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.ProductColor)
                    .ThenInclude(pc => pc.Product)
                .FirstOrDefaultAsync(od => od.OrderDetailId == orderDetailId);

            if (orderDetail == null)
            {
                throw new Exception($"OrderDetail with ID {orderDetailId} not found");
            }

            if (orderDetail.ProductColor?.Product == null)
            {
                throw new Exception($"Product not found for OrderDetail {orderDetailId}");
            }

            // Determine warranty period
            int warrantyMonths = warrantyPeriodMonths ?? 
                orderDetail.ProductColor.Product.WarrantyPeriodMonths ?? 
                12; // Default 12 months

            // Start date is the order date or current date
            var order = await _context.Orders.FindAsync(orderDetail.OrderId);
            DateTime startDate = order?.OrderDate ?? DateTime.UtcNow;

            // Calculate end date
            DateTime endDate = startDate.AddMonths(warrantyMonths);

            var warranty = new Warranty
            {
                OrderDetailId = orderDetailId,
                ProductId = orderDetail.ProductColor.Product.ProductId,
                WarrantyPeriodMonths = warrantyMonths,
                WarrantyType = "Standard",
                WarrantyDescription = orderDetail.ProductColor.Product.WarrantyTerms,
                StartDate = startDate,
                EndDate = endDate,
                CreatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            await _context.Warranties.AddAsync(warranty);
            await _context.SaveChangesAsync();

            return warranty;
        }

        public async Task<List<Warranty>> CreateWarrantiesForOrderAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
            {
                throw new Exception($"Order with ID {orderId} not found");
            }

            if (order.OrderDetails == null || order.OrderDetails.Count == 0)
            {
                throw new Exception($"Order {orderId} has no order details");
            }

            var createdWarranties = new List<Warranty>();

            foreach (var orderDetail in order.OrderDetails)
            {
                // Check if warranty already exists for this order detail
                var existingWarranty = await _context.Warranties
                    .FirstOrDefaultAsync(w => w.OrderDetailId == orderDetail.OrderDetailId);

                if (existingWarranty == null)
                {
                    try
                    {
                        var warranty = await CreateWarrantyForOrderDetailAsync(orderDetail.OrderDetailId);
                        createdWarranties.Add(warranty);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with other order details
                        Console.WriteLine($"Error creating warranty for OrderDetail {orderDetail.OrderDetailId}: {ex.Message}");
                    }
                }
            }

            return createdWarranties;
        }

        public async Task<bool> UpdateWarrantyStatusAsync(int warrantyId, string status)
        {
            var warranty = await _context.Warranties.FindAsync(warrantyId);
            if (warranty == null)
            {
                return false;
            }

            warranty.Status = status;
            _context.Warranties.Update(warranty);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

