using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.DTO.GET;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly TechZoneDbContext _context;

        public DashboardController(TechZoneDbContext context)
        {
            _context = context;
        }

        [HttpGet("statistics")]
        public async Task<ActionResult<DashboardStatisticsDTO>> GetStatistics()
        {
            try
            {
                var now = DateTime.Now;
                var yesterday = now.AddDays(-1);
                var lastWeek = now.AddDays(-7);

                // Total Users
                var totalUsers = await _context.Users.CountAsync();
                var usersYesterday = await _context.Users
                    .Where(u => u.CreatedAt < yesterday)
                    .CountAsync();
                var userGrowth = usersYesterday > 0
                    ? ((decimal)(totalUsers - usersYesterday) / usersYesterday) * 100
                    : 0;

                // Total Orders
                var totalOrders = await _context.Orders.CountAsync();
                var ordersLastWeek = await _context.Orders
                    .Where(o => o.OrderDate < lastWeek)
                    .CountAsync();
                var orderGrowth = ordersLastWeek > 0
                    ? ((decimal)(totalOrders - ordersLastWeek) / ordersLastWeek) * 100
                    : 0;

                // Total Sales
                var totalSales = await _context.Orders
                    .Where(o => o.Status != "CANCELLED")
                    .SumAsync(o => o.TotalAmount ?? 0);

                var salesYesterday = await _context.Orders
                    .Where(o => o.OrderDate < yesterday && o.Status != "CANCELLED")
                    .SumAsync(o => o.TotalAmount ?? 0);

                var salesGrowth = salesYesterday > 0
                    ? ((totalSales - salesYesterday) / salesYesterday) * 100
                    : 0;

                // Total Pending Orders
                var totalPending = await _context.Orders
                    .Where(o => o.Status == "PENDING")
                    .CountAsync();

                var pendingYesterday = await _context.Orders
                    .Where(o => o.Status == "PENDING" && o.OrderDate < yesterday)
                    .CountAsync();

                var pendingGrowth = pendingYesterday > 0
                    ? ((decimal)(totalPending - pendingYesterday) / pendingYesterday) * 100
                    : 0;

                var statistics = new DashboardStatisticsDTO
                {
                    TotalUsers = totalUsers,
                    TotalOrders = totalOrders,
                    TotalSales = totalSales,
                    TotalPending = totalPending,
                    UserGrowthPercentage = Math.Round(userGrowth, 1),
                    OrderGrowthPercentage = Math.Round(orderGrowth, 1),
                    SalesGrowthPercentage = Math.Round(salesGrowth, 1),
                    PendingGrowthPercentage = Math.Round(pendingGrowth, 1)
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error retrieving statistics", error = ex.Message });
            }
        }

        // ================= FIXED HERE =================
        [HttpGet("sales-chart")]
        public async Task<ActionResult<SalesChartDataDTO>> GetSalesChart([FromQuery] int days = 30)
        {
            try
            {
                var endDate = DateTime.Now.Date;
                var startDate = endDate.AddDays(-days);

                var orders = await _context.Orders
                    .Where(o => o.OrderDate >= startDate &&
                                o.OrderDate <= endDate &&
                                o.Status != "CANCELLED")
                    .Select(o => new { o.OrderDate, o.TotalAmount })
                    .ToListAsync();

                var salesData = orders
                    .Where(o => o.OrderDate.HasValue)
                    .GroupBy(o => o.OrderDate.Value.Date)
                    .Select(g => new SalesDataPointDTO
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Amount = g.Sum(o => o.TotalAmount ?? 0),
                        OrderCount = g.Count()
                    })
                    .OrderBy(s => s.Date)
                    .ToList();

                var allDates = Enumerable.Range(0, days + 1)
                    .Select(i => startDate.AddDays(i))
                    .ToList();

                var completeData = allDates.Select(date =>
                {
                    var key = date.ToString("yyyy-MM-dd");
                    var existing = salesData.FirstOrDefault(s => s.Date == key);

                    return existing ?? new SalesDataPointDTO
                    {
                        Date = key,
                        Amount = 0,
                        OrderCount = 0
                    };
                }).ToList();

                return Ok(new SalesChartDataDTO { SalesData = completeData });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error retrieving sales chart data", error = ex.Message });
            }
        }

        [HttpGet("recent-orders")]
        public async Task<ActionResult<List<RecentOrderDTO>>> GetRecentOrders([FromQuery] int limit = 10)
        {
            try
            {
                var recentOrders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.ProductColor)
                            .ThenInclude(pc => pc.Product)
                                .ThenInclude(p => p.ProductImages)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(limit)
                    .Select(o => new RecentOrderDTO
                    {
                        OrderId = o.OrderId,
                        ProductName = o.OrderDetails.FirstOrDefault() != null
                            ? o.OrderDetails.First().ProductColor.Product.Name
                            : "N/A",
                        ProductImage =
                            o.OrderDetails.FirstOrDefault() != null &&
                            o.OrderDetails.First().ProductColor.Product.ProductImages.Any()
                                ? o.OrderDetails.First().ProductColor.Product.ProductImages.First().ImageUrl
                                : "",
                        CustomerName = o.User.FullName ?? "Guest",
                        ShippingAddress = o.ShippingAddress,
                        OrderDate = o.OrderDate ?? DateTime.Now,
                        Quantity = o.OrderDetails.Sum(od => od.Quantity),
                        TotalAmount = o.TotalAmount ?? 0,
                        Status = o.Status
                    })
                    .ToListAsync();

                return Ok(recentOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error retrieving recent orders", error = ex.Message });
            }
        }

        [HttpGet("inventory-report")]
        public async Task<ActionResult<InventoryReportDTO>> GetInventoryReport(
            [FromQuery] string? category = null,
            [FromQuery] string? search = null)
        {
            try
            {
                var productsQuery = _context.Products
                    .Include(p => p.ProductColors)
                    .Include(p => p.ProductImages)
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(category))
                {
                    productsQuery = productsQuery
                        .Where(p => p.Category.CategoryName == category);
                }

                if (!string.IsNullOrEmpty(search))
                {
                    productsQuery = productsQuery
                        .Where(p => p.Name.Contains(search));
                }

                var products = await productsQuery.ToListAsync();

                var totalProducts = products.Count;
                var totalInventoryValue = products.Sum(p =>
                    p.Price * p.ProductColors.Sum(pc => pc.StockQuantity ?? 0));

                var productStocks = products.Select(p =>
                {
                    var totalStock = p.ProductColors.Sum(pc => pc.StockQuantity ?? 0);
                    var stockStatus =
                        totalStock == 0 ? "Out of Stock" :
                        totalStock < 10 ? "Low Stock" :
                        "In Stock";

                    return new ProductStockDTO
                    {
                        ProductId = p.ProductId,
                        ProductName = p.Name,
                        ProductImage = p.ProductImages.FirstOrDefault()?.ImageUrl,
                        CategoryName = p.Category?.CategoryName,
                        BrandName = p.Brand?.BrandName,
                        Price = p.Price,
                        TotalStock = totalStock,
                        StockStatus = stockStatus,
                        ColorStocks = p.ProductColors.Select(pc => new ColorStockDTO
                        {
                            ProductColorId = pc.ProductColorId,
                            Color = pc.Color,
                            ColorCode = pc.ColorCode,
                            StockQuantity = pc.StockQuantity ?? 0
                        }).ToList()
                    };
                })
                .OrderBy(p => p.TotalStock)
                .ToList();

                var report = new InventoryReportDTO
                {
                    TotalProducts = totalProducts,
                    LowStockProducts = productStocks.Count(p => p.StockStatus == "Low Stock"),
                    OutOfStockProducts = productStocks.Count(p => p.StockStatus == "Out of Stock"),
                    TotalInventoryValue = totalInventoryValue,
                    ProductStocks = productStocks
                };

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error retrieving inventory report", error = ex.Message });
            }
        }

        [HttpGet("top-products")]
        public async Task<ActionResult<TopProductsDTO>> GetTopProducts([FromQuery] int limit = 10)
        {
            try
            {
                var productSalesQuery =
                    from od in _context.OrderDetails
                    join o in _context.Orders on od.OrderId equals o.OrderId
                    where o.Status != "CANCELLED"
                    group od by od.ProductColorId into g
                    select new
                    {
                        ProductColorId = g.Key,
                        TotalSold = g.Sum(x => x.Quantity),
                        TotalRevenue = g.Sum(x => x.Quantity * (x.Price ?? 0))
                    };

                var productSales = await productSalesQuery.ToListAsync();

                var products = await _context.Products
                    .Include(p => p.ProductColors)
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .Include(p => p.ProductImages)
                    .ToListAsync();

                var productSalesList = products.Select(p =>
                {
                    var colorIds = p.ProductColors.Select(pc => pc.ProductColorId).ToList();
                    var sales = productSales.Where(ps => ps.ProductColorId.HasValue && colorIds.Contains(ps.ProductColorId.Value));

                    return new ProductSalesDTO
                    {
                        ProductId = p.ProductId,
                        ProductName = p.Name,
                        ProductImage = p.ProductImages.FirstOrDefault()?.ImageUrl,
                        CategoryName = p.Category?.CategoryName,
                        BrandName = p.Brand?.BrandName,
                        Price = p.Price,
                        TotalSold = sales.Sum(s => s.TotalSold),
                        TotalRevenue = sales.Sum(s => s.TotalRevenue),
                        TotalStock = p.ProductColors.Sum(pc => pc.StockQuantity ?? 0)
                    };
                }).ToList();

                return Ok(new TopProductsDTO
                {
                    BestSellers = productSalesList
                        .Where(p => p.TotalSold > 0)
                        .OrderByDescending(p => p.TotalSold)
                        .Take(limit)
                        .ToList(),

                    LeastSellers = productSalesList
                        .Where(p => p.TotalStock > 0)
                        .OrderBy(p => p.TotalSold)
                        .Take(limit)
                        .ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error retrieving top products", error = ex.Message });
            }
        }
    }
}
