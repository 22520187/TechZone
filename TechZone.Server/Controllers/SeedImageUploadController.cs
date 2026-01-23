using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Services;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedImageUploadController : ControllerBase
    {
        private readonly ISeedImageUploadService _seedImageUploadService;
        private readonly TechZoneDbContext _context;
        private readonly ILogger<SeedImageUploadController> _logger;

        public SeedImageUploadController(
            ISeedImageUploadService seedImageUploadService,
            TechZoneDbContext context,
            ILogger<SeedImageUploadController> logger)
        {
            _seedImageUploadService = seedImageUploadService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("upload-seed-images")]
        public async Task<IActionResult> UploadSeedImages()
        {
            try
            {
                var uploadResult = await _seedImageUploadService.UploadAllSeedImages();

                if (!uploadResult.Success)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Failed to upload seed images",
                        errors = uploadResult.Errors
                    });
                }

                // Update brand images in database
                await UpdateBrandImages(uploadResult.BrandImages);

                // Update product images in database
                await UpdateProductImages(uploadResult.ProductImages);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Seed images uploaded successfully",
                    brandImages = uploadResult.BrandImages.Count,
                    productImages = uploadResult.ProductImages.Count,
                    details = uploadResult
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading seed images: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while uploading seed images",
                    error = ex.Message
                });
            }
        }

        private async Task UpdateBrandImages(Dictionary<string, List<string>> brandImages)
        {
            foreach (var brandEntry in brandImages)
            {
                var brandName = NormalizeNameForMatching(brandEntry.Key);
                var imageUrl = brandEntry.Value.FirstOrDefault();

                if (string.IsNullOrEmpty(imageUrl))
                    continue;

                // Get all brands and do matching in memory
                var allBrands = await _context.Brands.ToListAsync();
                var brand = allBrands.FirstOrDefault(b =>
                    NormalizeNameForMatching(b.BrandName).Contains(brandName) ||
                    brandName.Contains(NormalizeNameForMatching(b.BrandName)));

                if (brand != null)
                {
                    brand.BrandImageUrl = imageUrl;
                    _context.Brands.Update(brand);
                    _logger.LogInformation($"Updated brand image for: {brand.BrandName}");
                }
                else
                {
                    _logger.LogWarning($"Could not find brand matching: {brandEntry.Key}");
                }
            }
        }

        private async Task UpdateProductImages(Dictionary<string, List<string>> productImages)
        {
            // Load all products with their images into memory once
            var allProducts = await _context.Products.Include(p => p.ProductImages).ToListAsync();

            foreach (var productEntry in productImages)
            {
                var productFolderName = productEntry.Key;
                var imageUrls = productEntry.Value;

                if (imageUrls.Count == 0)
                    continue;

                // Use first image as primary product image
                var primaryImageUrl = imageUrls[0];

                // Find product by name matching (in memory)
                var normalizedFolderName = NormalizeNameForMatching(productFolderName);
                var product = allProducts.FirstOrDefault(p =>
                    NormalizeNameForMatching(p.Name).Contains(normalizedFolderName) ||
                    normalizedFolderName.Contains(NormalizeNameForMatching(p.Name)));

                if (product != null)
                {
                    // Update primary image using ProductImages collection
                    var primaryImage = product.ProductImages.FirstOrDefault(img => img.IsPrimary ?? false);
                    if (primaryImage != null)
                    {
                        primaryImage.ImageUrl = primaryImageUrl;
                        _context.ProductImages.Update(primaryImage);
                    }
                    else if (product.ProductImages.Any())
                    {
                        // Update first image if no primary image exists
                        product.ProductImages.First().ImageUrl = primaryImageUrl;
                        _context.ProductImages.Update(product.ProductImages.First());
                    }
                    else
                    {
                        // Create new primary image if none exists
                        var newImage = new Models.Domain.ProductImage
                        {
                            ProductId = product.ProductId,
                            ImageUrl = primaryImageUrl,
                            IsPrimary = true
                        };
                        _context.ProductImages.Add(newImage);
                    }

                    _logger.LogInformation($"Updated product image for: {product.Name}");
                }
                else
                {
                    _logger.LogWarning($"Could not find product matching: {productFolderName}");
                }
            }
        }

        private string NormalizeNameForMatching(string name)
        {
            // Convert underscore to space, remove extra spaces, lowercase
            return name
                .Replace("_", " ")
                .Replace("-", " ")
                .ToLower()
                .Trim();
        }

        [HttpGet("check-seed-structure")]
        public IActionResult CheckSeedStructure()
        {
            try
            {
                var contentRoot = Directory.GetCurrentDirectory();
                var seedFolder = Path.Combine(contentRoot, "seed");

                var result = new {
                    seedFolderExists = Directory.Exists(seedFolder),
                    contentRootPath = contentRoot,
                    seedPath = seedFolder,
                    brandsFolderExists = false,
                    brandImages = 0,
                    productsFolderExists = false,
                    productFolders = 0
                };

                if (Directory.Exists(seedFolder))
                {
                    var brandsFolder = Path.Combine(seedFolder, "brands");
                    var productsFolder = Path.Combine(seedFolder, "products");

                    result = new
                    {
                        seedFolderExists = true,
                        contentRootPath = contentRoot,
                        seedPath = seedFolder,
                        brandsFolderExists = Directory.Exists(brandsFolder),
                        brandImages = Directory.Exists(brandsFolder) 
                            ? Directory.GetFiles(brandsFolder).Length 
                            : 0,
                        productsFolderExists = Directory.Exists(productsFolder),
                        productFolders = Directory.Exists(productsFolder)
                            ? Directory.GetDirectories(productsFolder).Length
                            : 0
                    };
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

