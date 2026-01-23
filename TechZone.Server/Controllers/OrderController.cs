using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.ADD;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;

        public OrderController(IOrderRepository orderRepository, IMapper mapper)
        {
            _orderRepository = orderRepository;
            _mapper = mapper;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetOrderByUserId(int userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);
            if (orders == null || orders.Count == 0)
            {
                // Return empty array instead of NotFound to allow frontend to show empty state
                return Ok(new List<OrderDTO>());
            }

            var orderDTOs = _mapper.Map<List<OrderDTO>>(orders);
            return Ok(orderDTOs);
        }

        [HttpGet("{orderId}")]
        public async Task<ActionResult> GetOrderById(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
            {
                return NotFound(new { Message = "Order not found." });
            }

            var orderDTO = _mapper.Map<OrderDTO>(order);
            return Ok(orderDTO);
        }

        [HttpPut("update-order-state/{orderId}")]
        public async Task<ActionResult> UpdateOrderState(int orderId, [FromBody] string newState)
        {
            var result = await _orderRepository.UpdateOrderStatusAsync(orderId, newState);
            if (!result)
            {
                return NotFound($"Order with ID {orderId} not found.");
            }
            return NoContent();
        }

        // Tạo đơn hàng mới từ giỏ hàng
        [HttpPost("create")]
        public async Task<ActionResult> CreateOrder([FromBody] CreateOrderRequestDTO createOrderRequest)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (createOrderRequest.UserId <= 0)
                {
                    return BadRequest("UserId không hợp lệ");
                }

                // Tạo đơn hàng
                var order = await _orderRepository.CreateOrderFromCartAsync(createOrderRequest);

                // Trả về thông tin đơn hàng đã tạo
                var orderDTO = _mapper.Map<OrderDTO>(order);
                return CreatedAtAction(nameof(GetOrderById), new { orderId = order.OrderId }, orderDTO);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("get-all")]
        public async Task<ActionResult> GetAllOrders()
        {
            var orders = await _orderRepository.GetAllOrdersAsync();
            if (orders == null || orders.Count == 0)
            {
                return Ok(new List<OrderDTO>());
            }
            
            var orderDTOs = _mapper.Map<List<OrderDTO>>(orders);
            return Ok(orderDTOs);
        }
    }

}