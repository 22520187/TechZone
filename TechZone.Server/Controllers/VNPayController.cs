using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Services;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VNPayController : ControllerBase
    {
        private readonly VNPayService _vnPayService;
        private readonly IOrderRepository _orderRepository;

        public VNPayController(VNPayService vnPayService, IOrderRepository orderRepository)
        {
            _vnPayService = vnPayService;
            _orderRepository = orderRepository;
        }

        [HttpPost("create-payment-url")]
        public IActionResult CreatePaymentUrl([FromBody] VNPayPaymentRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var paymentUrl = _vnPayService.CreatePaymentUrl(
                    request.OrderId,
                    request.Amount,
                    request.OrderInfo,
                    ipAddress
                );

                return Ok(new { paymentUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("payment-callback")]
        public async Task<IActionResult> PaymentCallback()
        {
            try
            {
                var queryCollection = HttpContext.Request.Query;

                // Validate signature
                var isValidSignature = _vnPayService.ValidateSignature(queryCollection);
                if (!isValidSignature)
                {
                    return BadRequest(new { message = "Invalid signature" });
                }

                // Get payment info
                var paymentInfo = _vnPayService.GetPaymentInfo(queryCollection);
                
                // Check if payment was successful
                var vnp_ResponseCode = paymentInfo.GetValueOrDefault("vnp_ResponseCode");
                var vnp_TxnRef = paymentInfo.GetValueOrDefault("vnp_TxnRef"); // Order ID
                var vnp_TransactionNo = paymentInfo.GetValueOrDefault("vnp_TransactionNo");

                if (vnp_ResponseCode == "00") // Payment successful
                {
                    // Update payment status to "Paid" and order status to "Processing"
                    if (int.TryParse(vnp_TxnRef, out int orderId))
                    {
                        await _orderRepository.UpdatePaymentStatusAsync(orderId, "Paid");
                        await _orderRepository.UpdateOrderStatusAsync(orderId, "PROCESSING");
                    }

                    return Ok(new 
                    { 
                        success = true,
                        message = "Payment successful",
                        orderId = vnp_TxnRef,
                        transactionNo = vnp_TransactionNo,
                        responseCode = vnp_ResponseCode
                    });
                }
                else
                {
                    // Payment failed - update payment status
                    if (int.TryParse(vnp_TxnRef, out int orderId))
                    {
                        await _orderRepository.UpdatePaymentStatusAsync(orderId, "Failed");
                        await _orderRepository.UpdateOrderStatusAsync(orderId, "CANCELLED");
                    }

                    return Ok(new 
                    { 
                        success = false,
                        message = "Payment failed",
                        orderId = vnp_TxnRef,
                        responseCode = vnp_ResponseCode
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class VNPayPaymentRequest
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
    }
}

