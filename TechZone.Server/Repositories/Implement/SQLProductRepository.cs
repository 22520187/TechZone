using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLProductRepository : TechZoneRepository<Product>, IProductRepository
    {
        public SQLProductRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<Product>> CustomerGetAllProductAsync()
        {
            return await dbContext.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Promotions)
            .Include(p => p.ProductImages)
            .Include(p => p.Reviews)
                .ThenInclude(r => r.User)
            .ToListAsync();
        }

        public async Task<Product> CustomerGetProductByIdAsync(int id)
        {
            return await dbContext.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.ProductColors)
            .Include(p => p.ProductImages)
            .Include(p => p.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.ProductId == id);
        }

        public async Task<List<Product>> AdminGetAllProductAsync()
        {
            return await dbContext.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .Include(p => p.ProductColors)
            .Include(p => p.Reviews)
            .ToListAsync();
        }
        public async Task<Product> AdminGetProductByIdAsync(int id)
        {
            return await dbContext.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .Include(p => p.ProductColors)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.ProductId == id);
        }
        public async Task<Product> AddProductAsync(Product product)
        {
            dbContext.Products.Add(product);
            await dbContext.SaveChangesAsync();
            return product; // Return the generated ProductId
        }

        public async Task<Product?> UpdateProductAsync(int productId, Product updatedProduct)
        {
            var existingProduct = await dbContext.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductColors)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (existingProduct == null)
            {
                return null;
            }

            // Update product details
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Description = updatedProduct.Description;
            existingProduct.LongDescription = updatedProduct.LongDescription;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.StockQuantity = updatedProduct.StockQuantity;
            existingProduct.BrandId = updatedProduct.BrandId;
            existingProduct.CategoryId = updatedProduct.CategoryId;

            // Update ProductImages
            var newImageUrls = updatedProduct.ProductImages.Select(img => img.ImageUrl).ToList();
            var existingImageUrls = existingProduct.ProductImages.Select(img => img.ImageUrl).ToList();

            // Remove images not in the new list
            var imagesToRemove = existingProduct.ProductImages
                .Where(img => !newImageUrls.Contains(img.ImageUrl))
                .ToList();
            dbContext.ProductImages.RemoveRange(imagesToRemove);

            // Add new images
            var imagesToAdd = newImageUrls
                .Where(url => !existingImageUrls.Contains(url))
                .Select(url => new ProductImage { ProductId = productId, ImageUrl = url })
                .ToList();
            foreach (var image in imagesToAdd)
            {
                existingProduct.ProductImages.Add(image);
            }

            // Update ProductColors
            var newColors = updatedProduct.ProductColors.Select(c => c.ColorCode).ToList();

            // Remove colors not in the new list
            var colorsToRemove = existingProduct.ProductColors
                .Where(c => !newColors.Contains(c.ColorCode))
                .ToList();
            dbContext.ProductColors.RemoveRange(colorsToRemove);

            // Add or update colors
            foreach (var updatedColor in updatedProduct.ProductColors)
            {
                var existingColor = existingProduct.ProductColors
                    .FirstOrDefault(c => c.ColorCode == updatedColor.ColorCode);

                if (existingColor != null)
                {
                    // Update StockQuantity if it has changed
                    if (existingColor.StockQuantity != updatedColor.StockQuantity)
                    {
                        existingColor.StockQuantity = updatedColor.StockQuantity;
                    }
                }
                else
                {
                    // Add new color
                    existingProduct.ProductColors.Add(new ProductColor
                    {
                        ProductId = productId,
                        Color = updatedColor.Color,
                        ColorCode = updatedColor.ColorCode,
                        StockQuantity = updatedColor.StockQuantity
                    });
                }
            }

            await dbContext.SaveChangesAsync();
            return existingProduct;
        }

        public async Task<Product> DeleteProductAsync(int productId)
        {
            // Tìm product với các related entities
            var product = await dbContext.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductColors)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null)
            {
                return null;
            }

            // Kiểm tra xem sản phẩm có trong đơn hàng nào không
            var hasOrders = await dbContext.OrderDetails.AnyAsync(od => od.ProductColorId.HasValue && 
                product.ProductColors.Select(pc => pc.ProductColorId).Contains(od.ProductColorId.Value));

            if (hasOrders)
            {
                throw new InvalidOperationException("Cannot delete product that has been ordered. Product has existing order history.");
            }

            // Xóa các related entities trước
            // 1. Xóa ProductImages
            if (product.ProductImages.Any())
            {
                dbContext.ProductImages.RemoveRange(product.ProductImages);
            }

            // 2. Xóa Reviews
            if (product.Reviews.Any())
            {
                dbContext.Reviews.RemoveRange(product.Reviews);
            }

            // 3. Xóa CartDetails liên quan đến ProductColors của product này
            var productColorIds = product.ProductColors.Select(pc => pc.ProductColorId).ToList();
            var cartDetailsToDelete = await dbContext.CartDetails
                .Where(cd => cd.ProductColorId.HasValue && productColorIds.Contains(cd.ProductColorId.Value))
                .ToListAsync();
            
            if (cartDetailsToDelete.Any())
            {
                dbContext.CartDetails.RemoveRange(cartDetailsToDelete);
            }

            // 4. Xóa ProductColors
            if (product.ProductColors.Any())
            {
                dbContext.ProductColors.RemoveRange(product.ProductColors);
            }

            // 5. Cuối cùng xóa Product
            dbContext.Products.Remove(product);
            await dbContext.SaveChangesAsync();

            return product;
        }

        public async Task<List<Product>> GetFeatureProductsAsync()
        {
            var now = DateTime.UtcNow;

            // First try to get products with active promotions
            var productsWithPromotions = await dbContext.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .Include(p => p.Promotions.Where(promo =>
                    promo.StartDate <= now && promo.EndDate >= now))
                .Where(p => p.Promotions.Any(promo =>
                    promo.StartDate <= now && promo.EndDate >= now))
                .OrderByDescending(p => p.Promotions
                    .Where(promo => promo.StartDate <= now && promo.EndDate >= now)
                    .Max(promo => promo.DiscountPercentage))
                .Take(5)
                .ToListAsync();

            // If no products with promotions found, return any 5 products
            if (!productsWithPromotions.Any())
            {
                return await dbContext.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.Promotions)
                    .Include(p => p.ProductImages)
                    .Include(p => p.Reviews)
                        .ThenInclude(r => r.User)
                    .Take(5)
                    .ToListAsync();
            }

            return productsWithPromotions;
        }

        public async Task<List<Product>> GetRecommendedProductsByOrderIdAsync(int orderId)
        {
            var now = DateTime.UtcNow;

            // Get order details to find purchased products
            var order = await dbContext.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Category)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductColor)
                        .ThenInclude(pc => pc.Product)
                            .ThenInclude(p => p.Brand)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null || !order.OrderDetails.Any())
            {
                // If order not found, fallback to featured products
                return await GetFeatureProductsAsync();
            }

            // Get purchased product IDs to exclude
            var purchasedProductIds = order.OrderDetails
                .Where(od => od.ProductColor != null && od.ProductColor.Product != null)
                .Select(od => od.ProductColor.Product.ProductId)
                .Distinct()
                .ToList();

            // Get categories and brands from purchased products
            var purchasedCategories = order.OrderDetails
                .Where(od => od.ProductColor != null && od.ProductColor.Product != null && od.ProductColor.Product.CategoryId.HasValue)
                .Select(od => od.ProductColor.Product.CategoryId!.Value)
                .Distinct()
                .ToList();

            var purchasedBrands = order.OrderDetails
                .Where(od => od.ProductColor != null && od.ProductColor.Product != null && od.ProductColor.Product.BrandId.HasValue)
                .Select(od => od.ProductColor.Product.BrandId!.Value)
                .Distinct()
                .ToList();

            // Try to get recommended products: same category or brand, excluding purchased products
            var recommendedProducts = await dbContext.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .Include(p => p.Promotions.Where(promo =>
                    promo.StartDate <= now && promo.EndDate >= now))
                .Where(p => !purchasedProductIds.Contains(p.ProductId) &&
                    p.CategoryId.HasValue && purchasedCategories.Contains(p.CategoryId.Value) ||
                    p.BrandId.HasValue && purchasedBrands.Contains(p.BrandId.Value))
                .OrderByDescending(p => p.Promotions
                    .Where(promo => promo.StartDate <= now && promo.EndDate >= now)
                    .Select(promo => promo.DiscountPercentage)
                    .DefaultIfEmpty(0)
                    .Max())
                .ThenByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0)
                .Take(4)
                .ToListAsync();

            // If we have enough recommended products, return them
            if (recommendedProducts.Count >= 4)
            {
                return recommendedProducts;
            }

            // If not enough, try to get products with promotions (excluding purchased)
            var productsWithPromotions = await dbContext.Products
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .Include(p => p.Promotions.Where(promo =>
                    promo.StartDate <= now && promo.EndDate >= now))
                .Where(p => !purchasedProductIds.Contains(p.ProductId) &&
                    p.Promotions.Any(promo =>
                        promo.StartDate <= now && promo.EndDate >= now))
                .OrderByDescending(p => p.Promotions
                    .Where(promo => promo.StartDate <= now && promo.EndDate >= now)
                    .Max(promo => promo.DiscountPercentage))
                .Take(4 - recommendedProducts.Count)
                .ToListAsync();

            recommendedProducts.AddRange(productsWithPromotions);

            // If still not enough, get any products excluding purchased ones
            if (recommendedProducts.Count < 4)
            {
                var recommendedProductIds = recommendedProducts.Select(rp => rp.ProductId).ToList();
                var additionalProducts = await dbContext.Products
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Include(p => p.Promotions)
                    .Include(p => p.ProductImages)
                    .Include(p => p.Reviews)
                        .ThenInclude(r => r.User)
                    .Where(p => !purchasedProductIds.Contains(p.ProductId) &&
                        !recommendedProductIds.Contains(p.ProductId))
                    .OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0)
                    .Take(4 - recommendedProducts.Count)
                    .ToListAsync();

                recommendedProducts.AddRange(additionalProducts);
            }

            // If still not enough (very rare), fallback to featured products
            if (recommendedProducts.Count < 4)
            {
                var featuredProducts = await GetFeatureProductsAsync();
                var featuredNotPurchased = featuredProducts
                    .Where(p => !purchasedProductIds.Contains(p.ProductId) &&
                        !recommendedProducts.Select(rp => rp.ProductId).Contains(p.ProductId))
                    .Take(4 - recommendedProducts.Count)
                    .ToList();
                recommendedProducts.AddRange(featuredNotPurchased);
            }

            return recommendedProducts.Take(4).ToList();
        }
    }
}
