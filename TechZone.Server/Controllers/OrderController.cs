using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;
using TechZone.Server.Models.DTO.GET;

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
                return NotFound(new { Message = "No orders found for this user." });
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
    }

}