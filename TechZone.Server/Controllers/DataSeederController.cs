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
            _context.Database.SetCommandTimeout(300);
            
            try
            {
                // Use execution strategy for retry-enabled transactions
                var strategy = _context.Database.CreateExecutionStrategy();
                
                return await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    
                    try
                    {
                        var random = new Random();
                        var createdUsers = new List<User>();
                        var createdProducts = new List<Product>();
                        var createdBrands = new List<Brand>();
                        var createdCategories = new List<Category>();

                // 1. Tạo Brands với dữ liệu thực tế
                var brandData = new[]
                {
                    new { Name = "Apple", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/apple.png" },
                    new { Name = "Samsung", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/samsung.png" },
                    new { Name = "Dell", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/dell.png" },
                    new { Name = "HP", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/hp.png" },
                    new { Name = "Asus", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/asus.png" },
                    new { Name = "Lenovo", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/lenovo.png" },
                    new { Name = "MSI", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/msi.png" },
                    new { Name = "Acer", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/acer.png" },
                    new { Name = "Sony", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/sony.png" },
                    new { Name = "LG", ImageUrl = "https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/brands/lg.png" }
                };

                foreach (var brand in brandData)
                {
                    if (!await _context.Brands.AnyAsync(b => b.BrandName == brand.Name))
                    {
                        var newBrand = new Brand
                        {
                            BrandName = brand.Name,
                            BrandImageUrl = brand.ImageUrl
                        };
                        _context.Brands.Add(newBrand);
                        createdBrands.Add(newBrand);
                    }
                }
                await _context.SaveChangesAsync();

                // 2. Tạo Categories với mô tả tiếng Việt
                var categoryData = new[]
                {
                    new { Name = "Laptop", Description = "Máy tính xách tay cao cấp, phù hợp cho công việc và giải trí" },
                    new { Name = "Điện thoại", Description = "Smartphone thông minh với công nghệ tiên tiến" },
                    new { Name = "Máy tính bảng", Description = "Tablet đa năng, màn hình lớn, trải nghiệm tuyệt vời" },
                    new { Name = "Tai nghe", Description = "Tai nghe chất lượng cao, âm thanh sống động" },
                    new { Name = "Đồng hồ thông minh", Description = "Smartwatch theo dõi sức khỏe và thông báo" },
                    new { Name = "Phụ kiện", Description = "Các phụ kiện công nghệ hỗ trợ thiết bị" },
                    new { Name = "PC Gaming", Description = "Máy tính gaming hiệu năng cao" },
                    new { Name = "Màn hình", Description = "Màn hình máy tính độ phân giải cao" }
                };

                foreach (var category in categoryData)
                {
                    if (!await _context.Categories.AnyAsync(c => c.CategoryName == category.Name))
                    {
                        var newCategory = new Category
                        {
                            CategoryName = category.Name,
                            Description = category.Description
                        };
                        _context.Categories.Add(newCategory);
                        createdCategories.Add(newCategory);
                    }
                }
                await _context.SaveChangesAsync();

                // Lấy tất cả brands và categories
                var brands = await _context.Brands.ToListAsync();
                var categories = await _context.Categories.ToListAsync();

                // 3. Tạo Users với tên và địa chỉ Việt Nam
                var vietnameseNames = new[]
                {
                    "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Thị Dung", "Hoàng Văn Em",
                    "Vũ Thị Phương", "Đặng Minh Hải", "Bùi Thị Hoa", "Đỗ Văn Khoa", "Ngô Thị Lan",
                    "Dương Văn Minh", "Phan Thị Ngọc", "Mai Văn Phú", "Lý Thị Quỳnh", "Tạ Văn Sơn",
                    "Chu Thị Thảo", "Võ Văn Tâm", "Trịnh Thị Uyên", "Lương Văn Vũ", "Đinh Thị Yến"
                };

                var cities = new[] { "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ" };
                var districts = new[] { "Quận 1", "Quận 2", "Quận 3", "Quận 7", "Quận 10", "Quận Bình Thạnh", "Quận Tân Bình" };
                var wards = new[] { "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường Bến Nghé", "Phường Đa Kao" };

                // Tạo 1 Admin, 2 Staff
                var adminUser = new User
                {
                    FullName = "Nguyễn Quản Trị",
                    Email = "admin@techzone.vn",
                    PasswordHash = "$2a$11$dummyHashForAdminAccount",
                    Phone = "0901234567",
                    City = "TP Hồ Chí Minh",
                    District = "Quận 1",
                    Ward = "Phường Bến Nghé",
                    Role = "Admin",
                    CreatedAt = DateTime.Now.AddMonths(-6)
                };
                _context.Users.Add(adminUser);
                createdUsers.Add(adminUser);

                for (int i = 1; i <= 2; i++)
                {
                    var staff = new User
                    {
                        FullName = $"Nhân viên số {i}",
                        Email = $"staff{i}@techzone.vn",
                        PasswordHash = "$2a$11$dummyHashForStaffAccount",
                        Phone = $"090123456{i}",
                        City = cities[random.Next(cities.Length)],
                        District = districts[random.Next(districts.Length)],
                        Ward = wards[random.Next(wards.Length)],
                        Role = "Staff",
                        CreatedAt = DateTime.Now.AddMonths(-random.Next(3, 6))
                    };
                    _context.Users.Add(staff);
                    createdUsers.Add(staff);
                }

                // Tạo 30 khách hàng
                for (int i = 0; i < 30; i++)
                {
                    var name = vietnameseNames[random.Next(vietnameseNames.Length)];
                    var email = $"khachhang{i + 1}@gmail.com";

                    var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                    if (existingUser != null)
                    {
                        createdUsers.Add(existingUser);
                        continue;
                    }

                    var user = new User
                    {
                        FullName = name,
                        Email = email,
                        PasswordHash = "$2a$11$dummyHashForCustomerAccount",
                        Phone = $"09{random.Next(10000000, 99999999)}",
                        City = cities[random.Next(cities.Length)],
                        District = districts[random.Next(districts.Length)],
                        Ward = wards[random.Next(wards.Length)],
                        Role = "Customer",
                        CreatedAt = DateTime.Now.AddDays(-random.Next(1, 180))
                    };
                    _context.Users.Add(user);
                    createdUsers.Add(user);
                }
                await _context.SaveChangesAsync();

                // 4. Tạo Promotions
                var promotions = new List<Promotion>();
                var promotionData = new[]
                {
                    new { Name = "Giảm giá mùa hè", Code = "SUMMER2024", Discount = 15m, DaysToExpire = 30 },
                    new { Name = "Khuyến mãi Black Friday", Code = "BLACKFRIDAY", Discount = 25m, DaysToExpire = 45 },
                    new { Name = "Giảm giá Tết", Code = "TET2024", Discount = 20m, DaysToExpire = 60 },
                    new { Name = "Sale cuối tuần", Code = "WEEKEND", Discount = 10m, DaysToExpire = 90 }
                };

                foreach (var promo in promotionData)
                {
                    var promotion = new Promotion
                    {
                        Name = promo.Name,
                        Description = $"Chương trình {promo.Name.ToLower()} giảm {promo.Discount}% cho sản phẩm được chọn",
                        PromotionCode = promo.Code,
                        DiscountPercentage = promo.Discount,
                        StartDate = DateTime.Now,
                        EndDate = DateTime.Now.AddDays(promo.DaysToExpire)
                    };
                    _context.Promotions.Add(promotion);
                    promotions.Add(promotion);
                }
                await _context.SaveChangesAsync();

                // 5. Tạo Products với tên và mô tả tiếng Việt
                var productData = new[]
                {
                    // Laptop
                    new { Name = "MacBook Pro 14 inch M3", Description = "Laptop Apple MacBook Pro 14 inch với chip M3 mạnh mẽ", LongDesc = "MacBook Pro 14 inch với chip M3 Pro/Max mang đến hiệu năng vượt trội cho công việc sáng tạo chuyên nghiệp. Màn hình Liquid Retina XDR 14.2 inch, hỗ trợ ProMotion 120Hz, độ sáng tối đa 1600 nits. Pin sử dụng lên đến 18 giờ.", Price = 52990000m, Category = "Laptop", Brand = "Apple", Warranty = 24 },
                    new { Name = "MacBook Air M2", Description = "Laptop mỏng nhẹ với chip M2", LongDesc = "MacBook Air M2 thiết kế siêu mỏng nhẹ, chỉ 1.24kg với hiệu năng ấn tượng. Chip M2 8 nhân CPU, 10 nhân GPU. Màn hình Liquid Retina 13.6 inch. Pin 18 giờ. Lựa chọn hoàn hảo cho sinh viên và dân văn phòng.", Price = 28990000m, Category = "Laptop", Brand = "Apple", Warranty = 12 },
                    new { Name = "Dell XPS 13 Plus", Description = "Laptop Dell XPS 13 Plus cao cấp", LongDesc = "Dell XPS 13 Plus với thiết kế tối giản, viền màn hình siêu mỏng. Intel Core i7 thế hệ 13, RAM 16GB, SSD 512GB. Màn hình 13.4 inch FHD+ hoặc 4K. Bàn phím cảm ứng haptic độc đáo.", Price = 35990000m, Category = "Laptop", Brand = "Dell", Warranty = 12 },
                    new { Name = "Dell Inspiron 15", Description = "Laptop Dell Inspiron 15 giá rẻ", LongDesc = "Dell Inspiron 15 phù hợp cho học tập và làm việc văn phòng. Intel Core i5, RAM 8GB, SSD 256GB. Màn hình 15.6 inch FHD. Pin 8 giờ. Giá cả phải chăng.", Price = 14990000m, Category = "Laptop", Brand = "Dell", Warranty = 12 },
                    new { Name = "HP Pavilion Gaming", Description = "Laptop gaming HP Pavilion", LongDesc = "HP Pavilion Gaming với Intel Core i5, RAM 16GB, SSD 512GB, VGA NVIDIA GTX 1650. Màn hình 15.6 inch 144Hz. Hệ thống tản nhiệt tốt. Chơi game mượt mà.", Price = 18990000m, Category = "Laptop", Brand = "HP", Warranty = 12 },
                    new { Name = "Asus ROG Strix G15", Description = "Laptop gaming Asus ROG cao cấp", LongDesc = "Asus ROG Strix G15 dành cho game thủ chuyên nghiệp. AMD Ryzen 9, RAM 32GB, SSD 1TB, VGA RTX 4060. Màn hình 15.6 inch 240Hz. Bàn phím RGB. Hệ thống tản nhiệt ROG Intelligent Cooling.", Price = 42990000m, Category = "Laptop", Brand = "Asus", Warranty = 24 },
                    new { Name = "Asus Zenbook 14", Description = "Laptop Asus Zenbook 14 mỏng nhẹ", LongDesc = "Asus Zenbook 14 thiết kế sang trọng, nhỏ gọn. Intel Core i7, RAM 16GB, SSD 512GB. Màn hình OLED 14 inch 2.8K. Pin 16 giờ. Hoàn hảo cho doanh nhân.", Price = 24990000m, Category = "Laptop", Brand = "Asus", Warranty = 12 },
                    new { Name = "Lenovo ThinkPad X1 Carbon", Description = "Laptop Lenovo ThinkPad doanh nghiệp", LongDesc = "Lenovo ThinkPad X1 Carbon Gen 11 dành cho doanh nghiệp. Intel Core i7 vPro, RAM 16GB, SSD 512GB. Màn hình 14 inch FHD+ hoặc 2.8K OLED. Bàn phím TrackPoint huyền thoại. Độ bền quân đội MIL-STD-810H.", Price = 38990000m, Category = "Laptop", Brand = "Lenovo", Warranty = 24 },
                    new { Name = "MSI Katana 15", Description = "Laptop gaming MSI Katana giá tốt", LongDesc = "MSI Katana 15 laptop gaming giá tầm trung. Intel Core i7, RAM 16GB, SSD 512GB, VGA RTX 4050. Màn hình 15.6 inch 144Hz. Thiết kế lấy cảm hứng từ kiếm samurai.", Price = 25990000m, Category = "Laptop", Brand = "MSI", Warranty = 24 },
                    
                    // Điện thoại
                    new { Name = "iPhone 15 Pro Max", Description = "iPhone 15 Pro Max 256GB", LongDesc = "iPhone 15 Pro Max với khung Titan siêu bền, chip A17 Pro 3nm. Camera 48MP, zoom quang học 5x, quay video ProRes. Màn hình Super Retina XDR 6.7 inch 120Hz. Nút Action đa năng.", Price = 34990000m, Category = "Điện thoại", Brand = "Apple", Warranty = 12 },
                    new { Name = "iPhone 14", Description = "iPhone 14 128GB", LongDesc = "iPhone 14 với chip A15 Bionic, camera kép 12MP. Màn hình Super Retina XDR 6.1 inch. Hỗ trợ 5G, Face ID, MagSafe. Pin cả ngày.", Price = 19990000m, Category = "Điện thoại", Brand = "Apple", Warranty = 12 },
                    new { Name = "Samsung Galaxy S24 Ultra", Description = "Samsung Galaxy S24 Ultra 512GB", LongDesc = "Samsung Galaxy S24 Ultra với Snapdragon 8 Gen 3 for Galaxy. Camera 200MP, zoom 100x, S Pen tích hợp. Màn hình Dynamic AMOLED 2X 6.8 inch 120Hz. Khung Titanium cao cấp.", Price = 33990000m, Category = "Điện thoại", Brand = "Samsung", Warranty = 12 },
                    new { Name = "Samsung Galaxy A54 5G", Description = "Samsung Galaxy A54 5G 128GB", LongDesc = "Samsung Galaxy A54 5G tầm trung. Camera 50MP OIS, màn hình Super AMOLED 6.4 inch 120Hz. Pin 5000mAh. Chống nước IP67. Giá tốt, trải nghiệm cao cấp.", Price = 9990000m, Category = "Điện thoại", Brand = "Samsung", Warranty = 12 },
                    
                    // Tablet
                    new { Name = "iPad Pro 12.9 inch M2", Description = "iPad Pro 12.9 inch với chip M2", LongDesc = "iPad Pro 12.9 inch với chip M2 8 nhân CPU, 10 nhân GPU. Màn hình Liquid Retina XDR mini-LED. Hỗ trợ Apple Pencil thế hệ 2, Magic Keyboard. Lý tưởng cho thiết kế đồ họa.", Price = 32990000m, Category = "Máy tính bảng", Brand = "Apple", Warranty = 12 },
                    new { Name = "iPad Air M1", Description = "iPad Air 10.9 inch chip M1", LongDesc = "iPad Air 10.9 inch với chip M1 mạnh mẽ. Màn hình Liquid Retina, Touch ID. Hỗ trợ Apple Pencil 2, Magic Keyboard. Cân bằng giữa hiệu năng và giá cả.", Price = 16990000m, Category = "Máy tính bảng", Brand = "Apple", Warranty = 12 },
                    new { Name = "Samsung Galaxy Tab S9", Description = "Samsung Galaxy Tab S9 11 inch", LongDesc = "Samsung Galaxy Tab S9 với Snapdragon 8 Gen 2. Màn hình Dynamic AMOLED 2X 11 inch 120Hz. S Pen đi kèm. Chống nước IP68. DeX mode biến thành laptop.", Price = 21990000m, Category = "Máy tính bảng", Brand = "Samsung", Warranty = 12 },
                    
                    // Tai nghe
                    new { Name = "AirPods Pro 2", Description = "Tai nghe Apple AirPods Pro thế hệ 2", LongDesc = "AirPods Pro 2 với chip H2, chống ồn chủ động nâng cao gấp đôi. Âm thanh Adaptive Audio. Hộp sạc MagSafe với loa tìm kiếm. Pin 6 giờ, 30 giờ với hộp.", Price = 6490000m, Category = "Tai nghe", Brand = "Apple", Warranty = 12 },
                    new { Name = "Sony WH-1000XM5", Description = "Tai nghe Sony WH-1000XM5 chống ồn", LongDesc = "Sony WH-1000XM5 tai nghe over-ear chống ồn hàng đầu. 8 micro chống ồn, processor V1. Âm thanh LDAC Hi-Res. Pin 30 giờ. Thiết kế gọn nhẹ hơn.", Price = 8990000m, Category = "Tai nghe", Brand = "Sony", Warranty = 12 },
                    
                    // Đồng hồ
                    new { Name = "Apple Watch Ultra 2", Description = "Apple Watch Ultra 2 Titanium", LongDesc = "Apple Watch Ultra 2 dành cho thể thao khắc nghiệt. Vỏ Titanium, màn hình Retina 49mm siêu sáng 3000 nits. Định vị GPS kép, độ sâu 100m. Pin 36 giờ, 72 giờ chế độ tiết kiệm.", Price = 21990000m, Category = "Đồng hồ thông minh", Brand = "Apple", Warranty = 12 },
                    new { Name = "Apple Watch Series 9", Description = "Apple Watch Series 9 41mm", LongDesc = "Apple Watch Series 9 với chip S9, màn hình sáng hơn. Double Tap điều khiển bằng cử chỉ. Theo dõi sức khỏe toàn diện. watchOS 10 mới.", Price = 10990000m, Category = "Đồng hồ thông minh", Brand = "Apple", Warranty = 12 },
                    new { Name = "Samsung Galaxy Watch 6", Description = "Samsung Galaxy Watch 6 40mm", LongDesc = "Samsung Galaxy Watch 6 thiết kế thanh lịch. Wear OS 4, One UI Watch 5. Theo dõi giấc ngủ, nhịp tim, SpO2. Pin 30 giờ. Kết nối với Android.", Price = 6990000m, Category = "Đồng hồ thông minh", Brand = "Samsung", Warranty = 12 },
                    
                    // PC Gaming
                    new { Name = "Asus ROG Gaming PC", Description = "PC Gaming Asus ROG cao cấp", LongDesc = "PC Gaming Asus ROG với Intel Core i9-14900K, RAM 32GB DDR5, SSD 2TB, VGA RTX 4080. Tản nhiệt nước AIO 360mm. Vỏ case ROG với RGB. Chiến mọi tựa game 4K.", Price = 75990000m, Category = "PC Gaming", Brand = "Asus", Warranty = 24 },
                    
                    // Màn hình
                    new { Name = "LG UltraGear 27 inch", Description = "Màn hình gaming LG 27 inch 240Hz", LongDesc = "LG UltraGear 27GN950 màn hình gaming 27 inch 4K 144Hz (OC 160Hz). Nano IPS, G-Sync/FreeSync. Thời gian phản hồi 1ms. HDR 600. Lý tưởng cho gaming và thiết kế.", Price = 14990000m, Category = "Màn hình", Brand = "LG", Warranty = 24 },
                    new { Name = "Dell UltraSharp 27", Description = "Màn hình Dell UltraSharp 27 4K", LongDesc = "Dell UltraSharp U2723DE màn hình 27 inch QHD IPS. Độ bao phủ màu 99% sRGB. USB-C 90W PD. Thiết kế không viền. Dành cho văn phòng và sáng tạo nội dung.", Price = 11990000m, Category = "Màn hình", Brand = "Dell", Warranty = 36 }
                };

                foreach (var prod in productData)
                {
                    var brand = brands.FirstOrDefault(b => b.BrandName == prod.Brand);
                    var category = categories.FirstOrDefault(c => c.CategoryName == prod.Category);

                    if (brand == null || category == null) continue;

                    var product = new Product
                    {
                        Name = prod.Name,
                        Description = prod.Description,
                        LongDescription = prod.LongDesc,
                        Price = prod.Price,
                        StockQuantity = random.Next(20, 100),
                        BrandId = brand.BrandId,
                        CategoryId = category.CategoryId,
                        WarrantyPeriodMonths = prod.Warranty,
                        WarrantyTerms = $"Bảo hành {prod.Warranty} tháng tại các trung tâm bảo hành chính hãng trên toàn quốc",
                        CreatedAt = DateTime.Now.AddDays(-random.Next(30, 180))
                    };
                    _context.Products.Add(product);
                    createdProducts.Add(product);
                }
                await _context.SaveChangesAsync();

                // 6. Thêm promotions cho một số products
                for (int i = 0; i < Math.Min(10, createdProducts.Count); i++)
                {
                    var product = createdProducts[i];
                    var promotion = promotions[random.Next(promotions.Count)];
                    product.Promotions.Add(promotion);
                }
                await _context.SaveChangesAsync();

                // 7. Tạo ProductColors cho mỗi product
                var colorData = new[]
                {
                    new { Name = "Đen", Code = "#000000" },
                    new { Name = "Trắng", Code = "#FFFFFF" },
                    new { Name = "Bạc", Code = "#C0C0C0" },
                    new { Name = "Xanh Dương", Code = "#0000FF" },
                    new { Name = "Xanh Lá", Code = "#00FF00" },
                    new { Name = "Đỏ", Code = "#FF0000" },
                    new { Name = "Vàng Gold", Code = "#FFD700" },
                    new { Name = "Tím", Code = "#800080" },
                    new { Name = "Hồng", Code = "#FFC0CB" }
                };

                foreach (var product in createdProducts)
                {
                    var numColors = random.Next(2, 5);
                    var usedColors = new HashSet<string>();

                    for (int i = 0; i < numColors; i++)
                    {
                        var color = colorData[random.Next(colorData.Length)];
                        if (usedColors.Contains(color.Name)) continue;
                        usedColors.Add(color.Name);

                        var productColor = new ProductColor
                        {
                            ProductId = product.ProductId,
                            Color = color.Name,
                            ColorCode = color.Code,
                            StockQuantity = random.Next(10, 50)
                        };
                        _context.ProductColors.Add(productColor);
                    }
                }
                await _context.SaveChangesAsync();

                // 8. Tạo ProductImages cho mỗi product (placeholder URLs)
                var allProductColors = await _context.ProductColors.ToListAsync();
                foreach (var product in createdProducts)
                {
                    var numImages = random.Next(3, 6);
                    for (int i = 0; i < numImages; i++)
                    {
                        var productImage = new ProductImage
                        {
                            ProductId = product.ProductId,
                            ImageUrl = $"https://res.cloudinary.com/dzpxhrxsq/image/upload/v1234567890/products/{product.ProductId}_{i + 1}.jpg",
                            IsPrimary = i == 0
                        };
                        _context.ProductImages.Add(productImage);
                    }
                }
                await _context.SaveChangesAsync();

                // 9. Tạo Orders (80 đơn hàng trong 90 ngày qua)
                var statuses = new[] { "PENDING", "PROCESSING", "COMPLETED", "CANCELLED" };
                var statusWeights = new[] { 10, 15, 70, 5 };
                var customerUsers = createdUsers.Where(u => u.Role == "Customer").ToList();

                for (int i = 1; i <= 80; i++)
                {
                    if (customerUsers.Count == 0) break;

                    var orderDate = DateTime.Now.AddDays(-random.Next(0, 90));
                    var user = customerUsers[random.Next(customerUsers.Count)];

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

                    var usePromotion = random.Next(100) < 30;
                    var selectedPromotion = usePromotion ? promotions[random.Next(promotions.Count)] : null;

                    var order = new Order
                    {
                        UserId = user.UserId,
                        OrderDate = orderDate,
                        Status = status,
                        PaymentMethod = random.Next(2) == 0 ? "COD" : "VNPAY",
                        PaymentStatus = status == "COMPLETED" ? "PAID" : (status == "CANCELLED" ? "CANCELLED" : "UNPAID"),
                        ShippingAddress = $"{user.Ward}, {user.District}, {user.City}",
                        FullName = user.FullName,
                        Phone = user.Phone,
                        PromotionId = selectedPromotion?.PromotionId,
                        TotalAmount = 0
                    };
                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    var numItems = random.Next(1, 4);
                    decimal totalPrice = 0;

                    for (int j = 0; j < numItems; j++)
                    {
                        var productColor = allProductColors[random.Next(allProductColors.Count)];
                        var product = await _context.Products
                            .FirstOrDefaultAsync(p => p.ProductId == productColor.ProductId);

                        if (product != null)
                        {
                            var quantity = random.Next(1, 3);
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

                            // Tạo Warranty cho completed orders
                            if (status == "COMPLETED" && product.WarrantyPeriodMonths.HasValue && product.WarrantyPeriodMonths > 0)
                            {
                                await _context.SaveChangesAsync(); // Save để lấy OrderDetailId

                                var warranty = new Warranty
                                {
                                    OrderDetailId = orderDetail.OrderDetailId,
                                    ProductId = product.ProductId,
                                    WarrantyPeriodMonths = product.WarrantyPeriodMonths.Value,
                                    WarrantyType = "Chính hãng",
                                    WarrantyDescription = product.WarrantyTerms ?? "Bảo hành chính hãng",
                                    StartDate = orderDate,
                                    EndDate = orderDate.AddMonths(product.WarrantyPeriodMonths.Value),
                                    CreatedAt = orderDate,
                                    Status = "Active"
                                };
                                _context.Warranties.Add(warranty);
                            }
                        }
                    }

                    if (selectedPromotion != null && selectedPromotion.DiscountPercentage.HasValue)
                    {
                        totalPrice = totalPrice * (1 - selectedPromotion.DiscountPercentage.Value / 100);
                    }

                    order.TotalAmount = totalPrice;
                    await _context.SaveChangesAsync();
                }

                // 10. Tạo Reviews cho các sản phẩm đã mua
                var completedOrders = await _context.Orders
                    .Where(o => o.Status == "COMPLETED")
                    .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                    .ToListAsync();

                var reviewComments = new[]
                {
                    "Sản phẩm rất tốt, đúng như mô tả",
                    "Giao hàng nhanh, đóng gói cẩn thận",
                    "Chất lượng tuyệt vời, rất hài lòng",
                    "Giá cả hợp lý, sẽ mua lại",
                    "Shop tư vấn nhiệt tình",
                    "Sản phẩm đẹp, hoạt động tốt",
                    "Đóng gói cẩn thận, ship nhanh",
                    "Chất lượng ổn, giá tốt",
                    "Rất đáng mua, 5 sao",
                    "Hài lòng với sản phẩm"
                };

                foreach (var order in completedOrders.Take(30))
                {
                    if (order.OrderDetails.Any())
                    {
                        var orderDetail = order.OrderDetails.First();
                        if (orderDetail.ProductColor?.ProductId != null)
                        {
                            var review = new Review
                            {
                                UserId = order.UserId,
                                ProductId = orderDetail.ProductColor.ProductId,
                                Rating = random.Next(4, 6),
                                Comment = reviewComments[random.Next(reviewComments.Length)],
                                CreatedAt = order.OrderDate.Value.AddDays(random.Next(3, 15))
                            };
                            _context.Reviews.Add(review);
                        }
                    }
                }
                await _context.SaveChangesAsync();
                        
                        // Commit transaction if everything succeeded
                        await transaction.CommitAsync();
                        
                        return Ok(new
                        {
                            success = true,
                            message = "Seed dữ liệu thành công!",
                            data = new
                            {
                                brands = createdBrands.Count,
                                categories = createdCategories.Count,
                                users = createdUsers.Count,
                                products = createdProducts.Count,
                                productColors = allProductColors.Count,
                                promotions = promotions.Count,
                                orders = 80,
                                reviews = 30,
                                warranties = "Đã tạo cho các đơn hàng hoàn thành"
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        // Rollback transaction on error
                        await transaction.RollbackAsync();
                        throw; // Re-throw to be caught by outer catch
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi seed dữ liệu",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace?.Substring(0, Math.Min(500, ex.StackTrace.Length))
                });
            }
            finally
            {
                // Reset timeout to default
                _context.Database.SetCommandTimeout(30);
            }
        }

        [HttpDelete("clear-all-data")]
        public async Task<IActionResult> ClearAllData()
        {
            // Increase command timeout to 5 minutes for large delete operations
            _context.Database.SetCommandTimeout(300);
            
            try
            {
                // Use execution strategy for retry-enabled operations
                var strategy = _context.Database.CreateExecutionStrategy();
                
                return await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        // Delete in order respecting foreign key constraints
                        // 1. Delete WarrantyClaims (depends on Warranty and User)
                        var warrantyClaims = await _context.WarrantyClaims.ToListAsync();
                    _context.WarrantyClaims.RemoveRange(warrantyClaims);
                    await _context.SaveChangesAsync();

                // 2. Delete Warranties (depends on OrderDetail and Product)
                var warranties = await _context.Warranties.ToListAsync();
                _context.Warranties.RemoveRange(warranties);
                await _context.SaveChangesAsync();

                // 3. Delete OrderDetails (depends on Order and ProductColor)
                var orderDetails = await _context.OrderDetails.ToListAsync();
                _context.OrderDetails.RemoveRange(orderDetails);
                await _context.SaveChangesAsync();

                // 4. Delete Orders (depends on User and Promotion)
                var orders = await _context.Orders.ToListAsync();
                _context.Orders.RemoveRange(orders);
                await _context.SaveChangesAsync();

                // 5. Delete CartDetails (depends on Cart and ProductColor)
                var cartDetails = await _context.CartDetails.ToListAsync();
                _context.CartDetails.RemoveRange(cartDetails);
                await _context.SaveChangesAsync();

                // 6. Delete Carts (depends on User)
                var carts = await _context.Carts.ToListAsync();
                _context.Carts.RemoveRange(carts);
                await _context.SaveChangesAsync();

                // 7. Delete Reviews (depends on User and Product)
                var reviews = await _context.Reviews.ToListAsync();
                _context.Reviews.RemoveRange(reviews);
                await _context.SaveChangesAsync();

                // 8. Delete ChatHistories (depends on User)
                var chatHistories = await _context.ChatHistories.ToListAsync();
                _context.ChatHistories.RemoveRange(chatHistories);
                await _context.SaveChangesAsync();

                // 9. Delete ProductColors (depends on Product)
                var productColors = await _context.ProductColors.ToListAsync();
                _context.ProductColors.RemoveRange(productColors);
                await _context.SaveChangesAsync();

                // 10. Delete ProductImages (depends on Product)
                var productImages = await _context.ProductImages.ToListAsync();
                _context.ProductImages.RemoveRange(productImages);
                await _context.SaveChangesAsync();

                // 11. Delete Product-Promotion relationships (many-to-many)
                var products = await _context.Products.Include(p => p.Promotions).ToListAsync();
                foreach (var product in products)
                {
                    product.Promotions.Clear();
                }
                await _context.SaveChangesAsync();

                // 12. Delete Promotions
                var promotions = await _context.Promotions.ToListAsync();
                _context.Promotions.RemoveRange(promotions);
                await _context.SaveChangesAsync();

                // 13. Delete Products (depends on Brand and Category)
                _context.Products.RemoveRange(products);
                await _context.SaveChangesAsync();

                // 14. Delete Users
                var users = await _context.Users.ToListAsync();
                _context.Users.RemoveRange(users);
                await _context.SaveChangesAsync();

                // 15. Delete Categories
                var categories = await _context.Categories.ToListAsync();
                _context.Categories.RemoveRange(categories);
                await _context.SaveChangesAsync();

                // 16. Delete Brands
                var brands = await _context.Brands.ToListAsync();
                _context.Brands.RemoveRange(brands);
                await _context.SaveChangesAsync();

                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            success = true,
                            message = "Đã xóa toàn bộ dữ liệu thành công!",
                            deleted = new
                            {
                                warrantyClaims = warrantyClaims.Count,
                                warranties = warranties.Count,
                                orderDetails = orderDetails.Count,
                                orders = orders.Count,
                                cartDetails = cartDetails.Count,
                                carts = carts.Count,
                                reviews = reviews.Count,
                                chatHistories = chatHistories.Count,
                                productColors = productColors.Count,
                                productImages = productImages.Count,
                                promotions = promotions.Count,
                                products = products.Count,
                                users = users.Count,
                                categories = categories.Count,
                                brands = brands.Count
                            }
                        });
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi khi xóa dữ liệu",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace?.Substring(0, Math.Min(500, ex.StackTrace.Length))
                });
            }
            finally
            {
                // Reset timeout to default
                _context.Database.SetCommandTimeout(30);
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
