using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using AutoMapper;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Repositories;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLOrderRepository : TechZoneRepository<Order>, IOrderRepository
    {
        private readonly IMapper _mapper;

        private readonly TechZoneDbContext _context;
        private readonly IWarrantyRepository _warrantyRepository;

        public SQLOrderRepository(TechZoneDbContext dbContext, IMapper mapper, IWarrantyRepository warrantyRepository) : base(dbContext)
        {
            _mapper = mapper;
            _context = dbContext;
            _warrantyRepository = warrantyRepository;
        }

        public async Task<Order?> GetOrderByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Category)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Brand)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.ProductImages)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .ToListAsync();
        }

        // New method to update order status
        public async Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
            
            if (order == null)
            {
                return false; // Order not found
            }

            var oldStatus = order.Status;
            order.Status = newStatus;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            // Auto-create warranties when order is delivered or completed
            if ((newStatus.Equals("Delivered", StringComparison.OrdinalIgnoreCase) || 
                 newStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase)) &&
                !oldStatus.Equals("Delivered", StringComparison.OrdinalIgnoreCase) &&
                !oldStatus.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            {
                await CreateWarrantiesForOrderAsync(order);
            }

            return true;
        }

        // Helper method to create warranties for all order details
        private async Task CreateWarrantiesForOrderAsync(Order order)
        {
            if (order == null || order.OrderDetails == null || order.OrderDetails.Count == 0)
            {
                Console.WriteLine($"Order {order?.OrderId} has no order details to create warranties for");
                return;
            }

            int createdCount = 0;
            int skippedCount = 0;
            var errors = new List<string>();

            foreach (var orderDetail in order.OrderDetails)
            {
                // Check if warranty already exists for this order detail
                var existingWarranty = await _context.Warranties
                    .FirstOrDefaultAsync(w => w.OrderDetailId == orderDetail.OrderDetailId);

                if (existingWarranty != null)
                {
                    skippedCount++;
                    Console.WriteLine($"Warranty already exists for OrderDetail {orderDetail.OrderDetailId}");
                    continue;
                }

                // Check if order detail has product color and product
                if (orderDetail.ProductColor == null)
                {
                    var errorMsg = $"OrderDetail {orderDetail.OrderDetailId} has no ProductColor";
                    errors.Add(errorMsg);
                    Console.WriteLine($"Error: {errorMsg}");
                    continue;
                }

                if (orderDetail.ProductColor.Product == null)
                {
                    var errorMsg = $"OrderDetail {orderDetail.OrderDetailId} has no Product";
                    errors.Add(errorMsg);
                    Console.WriteLine($"Error: {errorMsg}");
                    continue;
                }

                try
                {
                    await _warrantyRepository.CreateWarrantyForOrderDetailAsync(orderDetail.OrderDetailId);
                    createdCount++;
                    Console.WriteLine($"Successfully created warranty for OrderDetail {orderDetail.OrderDetailId}");
                }
                catch (Exception ex)
                {
                    var errorMsg = $"Error creating warranty for OrderDetail {orderDetail.OrderDetailId}: {ex.Message}";
                    errors.Add(errorMsg);
                    Console.WriteLine($"Error: {errorMsg}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
            }

            Console.WriteLine($"Warranty creation summary for Order {order.OrderId}: Created={createdCount}, Skipped={skippedCount}, Errors={errors.Count}");
            if (errors.Count > 0)
            {
                Console.WriteLine($"Errors: {string.Join("; ", errors)}");
            }
        }

        // New method to update payment status
        public async Task<bool> UpdatePaymentStatusAsync(int orderId, string paymentStatus)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return false; // Order not found
            }

            order.PaymentStatus = paymentStatus;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await dbContext.Orders
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                .Include(o => o.Promotion)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        // Tạo đơn hàng mới từ giỏ hàng
		public async Task<Order> CreateOrderFromCartAsync(CreateOrderRequestDTO createOrderRequest)
		{
			// Sử dụng execution strategy của EF Core để xử lý transaction
			var strategy = dbContext.Database.CreateExecutionStrategy();

			return await strategy.ExecuteAsync(async () =>
			{
				// Tạo transaction bên trong execution strategy
				using var transaction = await dbContext.Database.BeginTransactionAsync();
				try
				{
					// Lấy thông tin giỏ hàng của người dùng
					var cart = await dbContext.Carts
						.FirstOrDefaultAsync(c => c.UserId == createOrderRequest.UserId);

					if (cart == null)
					{
						throw new Exception($"Không tìm thấy giỏ hàng cho người dùng có ID {createOrderRequest.UserId}");
					}

					// Lấy chi tiết giỏ hàng
					var cartDetails = await dbContext.CartDetails
						.Include(cd => cd.ProductColor)
						.ThenInclude(pc => pc.Product)
						.Where(cd => cd.CartId == cart.CartId)
						.ToListAsync();

					if (cartDetails.Count == 0)
					{
						throw new Exception("Giỏ hàng trống, không thể tạo đơn hàng");
					}

					// Tạo đơn hàng mới
					var order = _mapper.Map<Order>(createOrderRequest);

					// Tính tổng tiền đơn hàng
					decimal totalAmount = 0;

					// Thêm đơn hàng vào database
					await dbContext.Orders.AddAsync(order);
					await dbContext.SaveChangesAsync();

					// Tạo chi tiết đơn hàng từ chi tiết giỏ hàng
					foreach (var cartDetail in cartDetails)
					{
						if (cartDetail.ProductColor == null || cartDetail.ProductColor.Product == null)
						{
							continue;
						}

						// Kiểm tra số lượng tồn kho
						if (cartDetail.ProductColor.StockQuantity < cartDetail.Quantity)
						{
							throw new Exception($"Sản phẩm {cartDetail.ProductColor.Product.Name} (màu {cartDetail.ProductColor.Color}) không đủ số lượng trong kho");
						}

						// Tạo chi tiết đơn hàng
						var orderDetail = new OrderDetail
						{
							OrderId = order.OrderId,
							ProductColorId = cartDetail.ProductColorId,
							Quantity = cartDetail.Quantity,
							Price = cartDetail.ProductColor.Product.Price
						};

						// Cập nhật tổng tiền
						totalAmount += orderDetail.Price.GetValueOrDefault() * orderDetail.Quantity;

						// Thêm chi tiết đơn hàng vào database
						await dbContext.OrderDetails.AddAsync(orderDetail);

						// Giảm số lượng tồn kho
						cartDetail.ProductColor.StockQuantity -= cartDetail.Quantity;
						dbContext.ProductColors.Update(cartDetail.ProductColor);
					}

					// Cập nhật tổng tiền đơn hàng
					order.TotalAmount = totalAmount;
					dbContext.Orders.Update(order);

					// Xóa giỏ hàng
					dbContext.CartDetails.RemoveRange(cartDetails);

					await dbContext.SaveChangesAsync();
					await transaction.CommitAsync();

					return order;
				}
				catch (Exception ex)
				{
					await transaction.RollbackAsync();
					throw new Exception($"Lỗi khi tạo đơn hàng: {ex.Message}", ex);
				}
			});
		}
    }
}