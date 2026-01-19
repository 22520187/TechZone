using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DataSeederController : ControllerBase
    {
        private readonly TechZoneDbContext _context;

        public DataSeederController(TechZoneDbContext context)
        {
            _context = context;
        }

        [HttpPost("seed-dashboard-data")]
        public async Task<IActionResult> SeedDashboardData()
        {
            try
            {
                var random = new Random();
                var createdUsers = new List<User>();
                var createdProducts = new List<Product>();
                var createdBrands = new List<Brand>();
                var createdCategories = new List<Category>();

                // 1. Create Brands if not exists
                var brandNames = new[] { "Apple", "Samsung", "Dell", "HP", "Asus", "Sony" };
                foreach (var brandName in brandNames)
                {
                    if (!await _context.Brands.AnyAsync(b => b.BrandName == brandName))
                    {
                        var brand = new Brand
                        {
                            BrandName = brandName
                        };
                        _context.Brands.Add(brand);
                        createdBrands.Add(brand);
                    }
                }
                await _context.SaveChangesAsync();

                // 2. Create Categories if not exists
                var categoryNames = new[] { "Laptop", "Smartphone", "Tablet", "Headphone", "Watch", "Accessory" };
                foreach (var categoryName in categoryNames)
                {
                    if (!await _context.Categories.AnyAsync(c => c.CategoryName == categoryName))
                    {
                        var category = new Category
                        {
                            CategoryName = categoryName,
                            Description = $"{categoryName} category"
                        };
                        _context.Categories.Add(category);
                        createdCategories.Add(category);
                    }
                }
                await _context.SaveChangesAsync();

                // Get all brands and categories
                var brands = await _context.Brands.ToListAsync();
                var categories = await _context.Categories.ToListAsync();

                // 3. Create Test Users (50 users over the last 30 days)
                for (int i = 1; i <= 50; i++)
                {
                    var email = $"testuser{i}@techzone.com";
                    
                    // Check if user already exists
                    var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                    if (existingUser != null)
                    {
                        createdUsers.Add(existingUser);
                        continue;
                    }

                    var createdAt = DateTime.Now.AddDays(-random.Next(0, 30));
                    var user = new User
                    {
                        FullName = $"Test User {i}",
                        Email = email,
                        PasswordHash = "$2a$11$dummyHashForTestingPurposesOnly",
                        Phone = $"090{random.Next(1000000, 9999999)}",
                        City = "Ho Chi Minh",
                        District = $"District {random.Next(1, 12)}",
                        Ward = $"Ward {random.Next(1, 20)}",
                        Role = "Customer",
                        CreatedAt = createdAt
                    };
                    _context.Users.Add(user);
                    createdUsers.Add(user);
                }
                await _context.SaveChangesAsync();

                // 4. Create Test Products (20 products)
                var productNames = new[]
                {
                    "iPhone 15 Pro Max", "MacBook Pro M3", "iPad Air", "AirPods Pro",
                    "Samsung Galaxy S24", "Samsung Galaxy Tab", "Galaxy Buds Pro",
                    "Dell XPS 13", "Dell Monitor 27", "HP Pavilion",
                    "HP Laptop Gaming", "Asus ROG", "Asus Zenbook",
                    "Sony WH-1000XM5", "Sony PlayStation 5", "Apple Watch Ultra",
                    "Samsung Watch 6", "iPad Pro", "MacBook Air", "Dell Inspiron"
                };

                for (int i = 0; i < productNames.Length && i < 20; i++)
                {
                    var brand = brands[random.Next(brands.Count)];
                    var category = categories[random.Next(categories.Count)];
                    
                    var product = new Product
                    {
                        Name = productNames[i],
                        Description = $"High quality {productNames[i]} with latest features",
                        Price = random.Next(5000000, 50000000), // 5M - 50M VND
                        BrandId = brand.BrandId,
                        CategoryId = category.CategoryId,
                        WarrantyPeriodMonths = random.Next(12, 36)
                    };
                    _context.Products.Add(product);
                    createdProducts.Add(product);
                }
                await _context.SaveChangesAsync();

                // 5. Create Product Colors for each product
                var colors = new[] 
                { 
                    ("Black", "#000000"), 
                    ("White", "#FFFFFF"), 
                    ("Silver", "#C0C0C0"),
                    ("Blue", "#0000FF"),
                    ("Red", "#FF0000")
                };

                foreach (var product in createdProducts)
                {
                    var numColors = random.Next(1, 4);
                    for (int i = 0; i < numColors; i++)
                    {
                        var color = colors[random.Next(colors.Length)];
                        var productColor = new ProductColor
                        {
                            ProductId = product.ProductId,
                            Color = color.Item1,
                            ColorCode = color.Item2,
                            StockQuantity = random.Next(10, 100)
                        };
                        _context.ProductColors.Add(productColor);
                    }
                }
                await _context.SaveChangesAsync();

                // Get all product colors
                var productColors = await _context.ProductColors.ToListAsync();

                // 6. Create Orders (100 orders over the last 90 days)
                var statuses = new[] { "PENDING", "PROCESSING", "COMPLETED", "CANCELLED" };
                var statusWeights = new[] { 15, 20, 60, 5 }; // Percentage distribution

                for (int i = 1; i <= 100; i++)
                {
                    var orderDate = DateTime.Now.AddDays(-random.Next(0, 90));
                    var user = createdUsers[random.Next(createdUsers.Count)];
                    
                    // Select status based on weights
                    var statusRandom = random.Next(100);
                    var status = "COMPLETED";
                    var cumulative = 0;
                    for (int s = 0; s < statuses.Length; s++)
                    {
                        cumulative += statusWeights[s];
                        if (statusRandom < cumulative)
                        {
                            status = statuses[s];
                            break;
                        }
                    }

                    var order = new Order
                    {
                        UserId = user.UserId,
                        OrderDate = orderDate,
                        Status = status,
                        PaymentMethod = random.Next(2) == 0 ? "COD" : "VNPAY",
                        PaymentStatus = status == "COMPLETED" ? "PAID" : "UNPAID",
                        ShippingAddress = $"{user.Ward}, {user.District}, {user.City}",
                        TotalAmount = 0 // Will calculate after adding order details
                    };
                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync(); // Save to get OrderId

                    // Add 1-3 order details
                    var numItems = random.Next(1, 4);
                    decimal totalPrice = 0;

                    for (int j = 0; j < numItems; j++)
                    {
                        var productColor = productColors[random.Next(productColors.Count)];
                        var quantity = random.Next(1, 3);
                        var product = await _context.Products
                            .FirstOrDefaultAsync(p => p.ProductId == productColor.ProductId);

                        if (product != null)
                        {
                            var unitPrice = product.Price;
                            var orderDetail = new OrderDetail
                            {
                                OrderId = order.OrderId,
                                ProductColorId = productColor.ProductColorId,
                                Quantity = quantity,
                                Price = unitPrice
                            };
                            _context.OrderDetails.Add(orderDetail);
                            totalPrice += unitPrice * quantity;
                        }
                    }

                    // Update order total price
                    order.TotalAmount = totalPrice;
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Dashboard test data seeded successfully!",
                    summary = new
                    {
                        usersCreated = 50,
                        productsCreated = createdProducts.Count,
                        brandsCreated = createdBrands.Count,
                        categoriesCreated = createdCategories.Count,
                        ordersCreated = 100,
                        timeRange = "Orders spread over last 90 days, Users over last 30 days"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error seeding data",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpDelete("clear-test-data")]
        public async Task<IActionResult> ClearTestData()
        {
            try
            {
                // Clear only test data (users with email containing 'testuser')
                var testUsers = await _context.Users
                    .Where(u => u.Email.Contains("testuser"))
                    .ToListAsync();

                var testUserIds = testUsers.Select(u => u.UserId).ToList();

                // Delete related orders
                var testOrders = await _context.Orders
                    .Where(o => o.UserId.HasValue && testUserIds.Contains(o.UserId.Value))
                    .ToListAsync();

                var testOrderIds = testOrders.Select(o => o.OrderId).ToList();

                // Delete order details
                var orderDetails = await _context.OrderDetails
                    .Where(od => od.OrderId.HasValue && testOrderIds.Contains(od.OrderId.Value))
                    .ToListAsync();
                _context.OrderDetails.RemoveRange(orderDetails);

                // Delete orders
                _context.Orders.RemoveRange(testOrders);

                // Delete users
                _context.Users.RemoveRange(testUsers);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Test data cleared successfully!",
                    deleted = new
                    {
                        users = testUsers.Count,
                        orders = testOrders.Count,
                        orderDetails = orderDetails.Count
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error clearing test data",
                    error = ex.Message
                });
            }
        }

        [HttpGet("test-data-summary")]
        public async Task<IActionResult> GetTestDataSummary()
        {
            try
            {
                var testUsersCount = await _context.Users
                    .Where(u => u.Email.Contains("testuser"))
                    .CountAsync();

                var testUserIds = await _context.Users
                    .Where(u => u.Email.Contains("testuser"))
                    .Select(u => u.UserId)
                    .ToListAsync();

                var testOrdersCount = await _context.Orders
                    .Where(o => o.UserId.HasValue && testUserIds.Contains(o.UserId.Value))
                    .CountAsync();

                return Ok(new
                {
                    testUsers = testUsersCount,
                    testOrders = testOrdersCount,
                    hasTestData = testUsersCount > 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error getting test data summary",
                    error = ex.Message
                });
            }
        }
    }
}
