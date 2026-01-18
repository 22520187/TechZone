using AutoMapper;
using TechZone.Server.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        private readonly IProductImageRepository _productImageRepository;
        private readonly IProductColorRepository _productColorRepository;
        private readonly IMapper _mapper;
        private readonly TechZoneDbContext _context;

        public ProductController(
            IProductRepository productRepository,
            IProductImageRepository productImageRepository,
            IProductColorRepository productColorRepository,
            IMapper mapper,
            TechZoneDbContext context)
        {
            _productRepository = productRepository;
            _productImageRepository = productImageRepository;
            _productColorRepository = productColorRepository;
            _mapper = mapper;
            _context = context;
        }

        [HttpGet("CustomerGetAllProduct")]
        public async Task<ActionResult> CustomerGetAllProduct()
        {
            try
            {
                var products = await _productRepository.CustomerGetAllProductAsync();
                return Ok(_mapper.Map<List<CustomerProductDTO>>(products));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("CustomerGetProductById/{id}")]
        public async Task<ActionResult> CustomerGetProductById(int id)
        {
            try
            {
                var product = await _productRepository.CustomerGetProductByIdAsync(id);
                return Ok(_mapper.Map<CustomerDetailProductDTO>(product));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("AdminGetAllProduct")]
        public async Task<ActionResult> AdminGetAllProduct()
        {
            try
            {
                var products = await _productRepository.AdminGetAllProductAsync();
                if (products == null || products.Count == 0)
                {
                    return NotFound("No products found");
                }
                return Ok(_mapper.Map<List<AdminProductDTO>>(products));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("AdminGetProductById/{id}")]
        public async Task<ActionResult> AdminGetProductById(int id)
        {
            try
            {
                var product = await _productRepository.AdminGetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound("Product not found");
                }
                return Ok(_mapper.Map<AdminDetailProductDTO>(product));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetProductImagesByProductId/{productId}")]
        public async Task<ActionResult> GetProductImagesByProductId(int productId)
        {
            try
            {
                var productImages = await _productImageRepository.GetProductImagesByProductIdAsync(productId);
                if (productImages == null || productImages.Count == 0)
                {
                    return NotFound("No images found for this product.");
                }
                return Ok(productImages);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetProductColorsByProductId/{productId}")]
        public async Task<ActionResult> GetProductColorsByProductId(int productId)
        {
            try
            {
                var productColors = await _productColorRepository.GetProductColorsByProductIdAsync(productId);
                if (productColors == null || productColors.Count == 0)
                {
                    return NotFound("No colors found for this product.");
                }
                return Ok(productColors);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetFeatureProducts")]
        public async Task<ActionResult> GetFeatureProducts()
        {
            try
            {
                var products = await _productRepository.GetFeatureProductsAsync();
                return Ok(_mapper.Map<List<CustomerProductDTO>>(products));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("AddProduct")]
        public async Task<ActionResult> AddProduct([FromBody] AdminAddProductDTO adminAddProductDTO)
        {
            try
            {
                // Validate input
                if (adminAddProductDTO.Colors == null || !adminAddProductDTO.Colors.Any())
                {
                    return BadRequest("Product must have at least one color variant");
                }

                var product = _mapper.Map<Product>(adminAddProductDTO);
                int productId = (await _productRepository.AddProductAsync(product)).ProductId;

                // Filter and add product images
                var productImages = adminAddProductDTO.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select(url => new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = url.Trim()
                    }).ToList();

                if (productImages.Any())
                {
                    await _productImageRepository.AddProductImagesAsync(productImages);
                }

                // Add product colors
                var productColors = adminAddProductDTO.Colors
                    .Where(c => !string.IsNullOrWhiteSpace(c.Color))
                    .Select(color => new ProductColor
                    {
                        ProductId = productId,
                        Color = color.Color,
                        ColorCode = color.ColorCode,
                        StockQuantity = color.StockQuantity
                    }).ToList();

                if (productColors.Any())
                {
                    await _productColorRepository.AddProductColorsAsync(productColors);
                }
                else
                {
                    return BadRequest("Product must have at least one valid color variant");
                }

                return await AdminGetProductById(productId);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { 
                        message = "Error adding product", 
                        error = ex.Message,
                        innerError = ex.InnerException?.Message 
                    });
            }
        }

        [HttpPut("UpdateProduct/{id}")]
        public async Task<ActionResult> UpdateProduct(int id, [FromBody] AdminUpdateProductDTO adminUpdateProductDTO)
        {
            try
            {
                if (adminUpdateProductDTO == null)
                {
                    return BadRequest("Invalid product data.");
                }

                // Validate colors
                if (adminUpdateProductDTO.Colors == null || !adminUpdateProductDTO.Colors.Any())
                {
                    return BadRequest("Product must have at least one color variant");
                }

                // Update product basic info
                var updatedProduct = _mapper.Map<Product>(adminUpdateProductDTO);
                var product = await _productRepository.UpdateProductAsync(id, updatedProduct);
                if (product == null)
                {
                    return NotFound("Product not found.");
                }

                // Update product images - Always safe to delete and recreate
                await _productImageRepository.DeleteProductImagesByProductIdAsync(id);

                var productImages = adminUpdateProductDTO.ImageUrls
                    .Where(url => !string.IsNullOrWhiteSpace(url))
                    .Select(url => new ProductImage
                    {
                        ProductId = id,
                        ImageUrl = url.Trim()
                    }).ToList();

                if (productImages.Any())
                {
                    await _productImageRepository.AddProductImagesAsync(productImages);
                }

                // For colors: Smart update strategy
                // 1. Get existing colors
                var existingColors = await _productColorRepository.GetProductColorsByProductIdAsync(id);
                var existingColorIds = existingColors.Select(c => c.ProductColorId).ToList();

                // 2. Check which colors are in OrderDetails (cannot be deleted)
                var orderedColorIds = await _context.OrderDetails
                    .Where(od => od.ProductColorId.HasValue && existingColorIds.Contains(od.ProductColorId.Value))
                    .Select(od => od.ProductColorId.Value)
                    .Distinct()
                    .ToListAsync();

                // 3. Delete colors that are NOT in orders
                var colorIdsToDelete = existingColors
                    .Where(c => !orderedColorIds.Contains(c.ProductColorId))
                    .Select(c => c.ProductColorId)
                    .ToList();

                foreach (var colorId in colorIdsToDelete)
                {
                    await _productColorRepository.DeleteAsync(c => c.ProductColorId == colorId);
                }

                // 4. Add new colors from DTO
                var newProductColors = adminUpdateProductDTO.Colors
                    .Where(c => !string.IsNullOrWhiteSpace(c.Color))
                    .Select(color => new ProductColor
                    {
                        ProductId = id,
                        Color = color.Color,
                        ColorCode = color.ColorCode,
                        StockQuantity = color.StockQuantity
                    }).ToList();

                if (newProductColors.Any())
                {
                    await _productColorRepository.AddProductColorsAsync(newProductColors);
                }

                var resultMessage = orderedColorIds.Any() 
                    ? "Product updated successfully. Note: Some colors cannot be deleted as they exist in orders."
                    : "Product updated successfully.";

                return Ok(new { 
                    message = resultMessage,
                    product = await AdminGetProductById(id)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { 
                        message = "Error updating product", 
                        error = ex.Message,
                        innerError = ex.InnerException?.Message 
                    });
            }
        }

        [HttpDelete("DeleteProduct/{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var deletedProduct = await _productRepository.DeleteProductAsync(id);
                if (deletedProduct == null)
                {
                    return NotFound("Product not found.");
                }

                return Ok("Product deleted successfully.");
            }
            catch (InvalidOperationException ex)
            {
                // Lỗi business logic (ví dụ: sản phẩm đã có đơn hàng)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Lỗi hệ thống
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { 
                        message = "Error deleting product", 
                        error = ex.Message,
                        innerError = ex.InnerException?.Message 
                    });
            }
        }
    }

}