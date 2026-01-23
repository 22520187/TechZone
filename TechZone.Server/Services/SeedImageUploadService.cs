using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Text.RegularExpressions;

namespace TechZone.Server.Services
{
    public interface ISeedImageUploadService
    {
        Task<Dictionary<string, List<string>>> UploadBrandImages();
        Task<Dictionary<string, List<string>>> UploadProductImages();
        Task<SeedImageUploadResult> UploadAllSeedImages();
    }

    public class SeedImageUploadResult
    {
        public bool Success { get; set; }
        public Dictionary<string, List<string>> BrandImages { get; set; } = new();
        public Dictionary<string, List<string>> ProductImages { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class SeedImageUploadService : ISeedImageUploadService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<SeedImageUploadService> _logger;

        public SeedImageUploadService(IConfiguration configuration, IWebHostEnvironment env, ILogger<SeedImageUploadService> logger)
        {
            var account = new Account(
                configuration["Cloudinary:CloudName"],
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
            _env = env;
            _logger = logger;
        }

        public async Task<Dictionary<string, List<string>>> UploadBrandImages()
        {
            var result = new Dictionary<string, List<string>>();
            var brandsFolder = Path.Combine(_env.ContentRootPath, "seed", "brands");

            if (!Directory.Exists(brandsFolder))
            {
                _logger.LogWarning($"Brands folder not found: {brandsFolder}");
                return result;
            }

            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };
            var imageFiles = Directory.GetFiles(brandsFolder)
                .Where(f => imageExtensions.Contains(Path.GetExtension(f).ToLower()))
                .ToList();

            foreach (var imageFile in imageFiles)
            {
                try
                {
                    var fileName = Path.GetFileNameWithoutExtension(imageFile);
                    var uploadUrl = await UploadImageFile(imageFile, "brands", fileName);
                    
                    if (!result.ContainsKey(fileName))
                        result[fileName] = new List<string>();
                    
                    result[fileName].Add(uploadUrl);
                    _logger.LogInformation($"Uploaded brand image: {fileName}");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error uploading brand image {imageFile}: {ex.Message}");
                }
            }

            return result;
        }

        public async Task<Dictionary<string, List<string>>> UploadProductImages()
        {
            var result = new Dictionary<string, List<string>>();
            var productsFolder = Path.Combine(_env.ContentRootPath, "seed", "products");

            if (!Directory.Exists(productsFolder))
            {
                _logger.LogWarning($"Products folder not found: {productsFolder}");
                return result;
            }

            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif" };
            var productFolders = Directory.GetDirectories(productsFolder);

            foreach (var productFolder in productFolders)
            {
                var productFolderName = Path.GetFileName(productFolder);
                var imageFiles = Directory.GetFiles(productFolder)
                    .Where(f => imageExtensions.Contains(Path.GetExtension(f).ToLower()))
                    .OrderBy(f => f)
                    .ToList();

                if (imageFiles.Count == 0)
                {
                    _logger.LogWarning($"No images found in product folder: {productFolderName}");
                    continue;
                }

                result[productFolderName] = new List<string>();

                foreach (var imageFile in imageFiles)
                {
                    try
                    {
                        var fileName = Path.GetFileNameWithoutExtension(imageFile);
                        var uploadUrl = await UploadImageFile(imageFile, $"products/{productFolderName}", fileName);
                        result[productFolderName].Add(uploadUrl);
                        _logger.LogInformation($"Uploaded product image: {productFolderName}/{fileName}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error uploading product image {imageFile}: {ex.Message}");
                    }
                }
            }

            return result;
        }

        public async Task<SeedImageUploadResult> UploadAllSeedImages()
        {
            var uploadResult = new SeedImageUploadResult();

            try
            {
                _logger.LogInformation("Starting seed image upload...");
                
                uploadResult.BrandImages = await UploadBrandImages();
                _logger.LogInformation($"Uploaded {uploadResult.BrandImages.Count} brand image groups");
                
                uploadResult.ProductImages = await UploadProductImages();
                _logger.LogInformation($"Uploaded {uploadResult.ProductImages.Count} product image groups");
                
                uploadResult.Success = true;
                _logger.LogInformation("Seed image upload completed successfully");
            }
            catch (Exception ex)
            {
                uploadResult.Success = false;
                uploadResult.Errors.Add($"Unexpected error during upload: {ex.Message}");
                _logger.LogError($"Error during seed image upload: {ex.Message}");
            }

            return uploadResult;
        }

        private async Task<string> UploadImageFile(string filePath, string folder, string fileName)
        {
            using var fileStream = System.IO.File.OpenRead(filePath);
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(Path.GetFileName(filePath), fileStream),
                Folder = folder,
                PublicId = fileName,
                UniqueFilename = false,
                Overwrite = true
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }
    }
}
