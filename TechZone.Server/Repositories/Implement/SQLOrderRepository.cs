using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using AutoMapper;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.GET;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLOrderRepository : TechZoneRepository<Order>, IOrderRepository
    {
        private readonly IMapper _mapper;

        private readonly TechZoneDbContext _context;

        public SQLOrderRepository(TechZoneDbContext dbContext, IMapper mapper) : base(dbContext)
        {
            _mapper = mapper;
            _context = dbContext;
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders
            .Include(o => o.OrderDetails)
            .ThenInclude(od => od.ProductColor)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .ToListAsync();
        }
    }
}