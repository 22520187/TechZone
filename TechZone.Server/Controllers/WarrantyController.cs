using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WarrantyController : ControllerBase
    {
        private readonly IWarrantyRepository _warrantyRepository;
        private readonly IMapper _mapper;
        private readonly TechZoneDbContext _context;

        public WarrantyController(IWarrantyRepository warrantyRepository, IMapper mapper, TechZoneDbContext context)
        {
            _warrantyRepository = warrantyRepository;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetWarrantiesByUserId(int userId)
        {
            var warranties = await _warrantyRepository.GetWarrantiesByUserIdAsync(userId);
            if (warranties == null || warranties.Count == 0)
            {
                return Ok(new List<WarrantyDTO>());
            }

            var warrantyDTOs = _mapper.Map<List<WarrantyDTO>>(warranties);
            return Ok(warrantyDTOs);
        }

        [HttpGet("{warrantyId}")]
        public async Task<ActionResult> GetWarrantyById(int warrantyId)
        {
            var warranty = await _warrantyRepository.GetWarrantyByIdAsync(warrantyId);
            if (warranty == null)
            {
                return NotFound(new { Message = "Warranty not found." });
            }

            var warrantyDTO = _mapper.Map<WarrantyDTO>(warranty);
            return Ok(warrantyDTO);
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult> GetWarrantiesByOrderId(int orderId)
        {
            var warranties = await _warrantyRepository.GetWarrantiesByOrderIdAsync(orderId);
            if (warranties == null || warranties.Count == 0)
            {
                return Ok(new List<WarrantyDTO>());
            }

            var warrantyDTOs = _mapper.Map<List<WarrantyDTO>>(warranties);
            return Ok(warrantyDTOs);
        }

        [HttpGet("order-detail/{orderDetailId}")]
        public async Task<ActionResult> GetWarrantiesByOrderDetailId(int orderDetailId)
        {
            var warranties = await _warrantyRepository.GetWarrantiesByOrderDetailIdAsync(orderDetailId);
            if (warranties == null || warranties.Count == 0)
            {
                return Ok(new List<WarrantyDTO>());
            }

            var warrantyDTOs = _mapper.Map<List<WarrantyDTO>>(warranties);
            return Ok(warrantyDTOs);
        }

        [HttpPost("create/{orderDetailId}")]
        public async Task<ActionResult> CreateWarrantyForOrderDetail(int orderDetailId, [FromQuery] int? warrantyPeriodMonths = null)
        {
            try
            {
                var warranty = await _warrantyRepository.CreateWarrantyForOrderDetailAsync(orderDetailId, warrantyPeriodMonths);
                var warrantyDTO = _mapper.Map<WarrantyDTO>(warranty);
                return CreatedAtAction(nameof(GetWarrantyById), new { warrantyId = warranty.WarrantyId }, warrantyDTO);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-for-order/{orderId}")]
        public async Task<ActionResult> CreateWarrantiesForOrder(int orderId)
        {
            try
            {
                var warranties = await _warrantyRepository.CreateWarrantiesForOrderAsync(orderId);
                if (warranties.Count == 0)
                {
                    return Ok(new { Message = "All order details already have warranties.", Warranties = new List<WarrantyDTO>() });
                }

                var warrantyDTOs = _mapper.Map<List<WarrantyDTO>>(warranties);
                return Ok(new { Message = $"Created {warranties.Count} warranty(ies) for order {orderId}.", Warranties = warrantyDTOs });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create-for-completed-orders")]
        public async Task<ActionResult> CreateWarrantiesForCompletedOrders()
        {
            try
            {
                // Get all orders with status "Completed" or "Delivered" (case-insensitive) that don't have warranties
                var completedOrders = await _context.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductColor)
                            .ThenInclude(pc => pc.Product)
                    .Where(o => (o.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) || 
                                 o.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase)) && 
                                o.OrderDetails != null && o.OrderDetails.Any())
                    .ToListAsync();

                var totalCreated = 0;
                var ordersProcessed = 0;
                var errors = new List<string>();

                foreach (var order in completedOrders)
                {
                    try
                    {
                        var warranties = await _warrantyRepository.CreateWarrantiesForOrderAsync(order.OrderId);
                        totalCreated += warranties.Count;
                        ordersProcessed++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Order {order.OrderId}: {ex.Message}");
                    }
                }

                return Ok(new 
                { 
                    Message = $"Processed {ordersProcessed} orders. Created {totalCreated} warranty(ies).",
                    OrdersProcessed = ordersProcessed,
                    WarrantiesCreated = totalCreated,
                    Errors = errors
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("status/{warrantyId}")]
        public async Task<ActionResult> UpdateWarrantyStatus(int warrantyId, [FromBody] string status)
        {
            var result = await _warrantyRepository.UpdateWarrantyStatusAsync(warrantyId, status);
            if (!result)
            {
                return NotFound(new { Message = $"Warranty with ID {warrantyId} not found." });
            }
            return NoContent();
        }
    }
}

