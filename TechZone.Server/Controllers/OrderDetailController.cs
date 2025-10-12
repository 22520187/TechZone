using AutoMapper;
using TechZone.Server.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailController : ControllerBase
    {
        private readonly IOrderDetailRepository _orderDetailRepository;

        public OrderDetailController(IOrderDetailRepository orderDetailRepository)
        {
            _orderDetailRepository = orderDetailRepository;
        }

        //Lấy chi tiết đơn hàng theo Id
        [HttpGet("{orderDetailId}")]

        public async Task<ActionResult<OrderDetail>> GetOrderDetailById(int orderDetailId)
        {
            if (orderDetailId <= 0)
            {
                return BadRequest("Invalid order detail Id");
            }

            var orderDetail = await _orderDetailRepository.GetOrderDetailByIdAsync(orderDetailId);
            if (orderDetail == null)
            {
                return NotFound($"Order detail with ID {orderDetailId} not found.");
            }
            return Ok(orderDetail);
        }

        //Lấy OrderDetail theo OrderId
		[HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetOrderDetailsByOrderId(int orderId)
		{
			var orderDetails = await _orderDetailRepository.GetOrderDetailsByOrderIdAsync(orderId);
			if (orderDetails == null || !orderDetails.Any())
			{
				return NotFound($"No order details found for OrderId {orderId}");
			}
			return Ok(orderDetails);
		}
    }
}