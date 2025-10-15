using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLReviewRepository : TechZoneRepository<Review>, IReviewRepository
    {
        public SQLReviewRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Review> AddReviewAsync(AddReviewRequestDTO addReviewRequest)
        {
            // Validate that the Product exists
            var productExists = await dbContext.Products.AnyAsync(p => p.ProductId == addReviewRequest.ProductId);
            if (!productExists)
            {
                throw new ArgumentException($"Product with ID {addReviewRequest.ProductId} does not exist.");
            }

            // Check if user has already reviewed this product
            var existingReview = await dbContext.Reviews
                .FirstOrDefaultAsync(r => r.UserId == addReviewRequest.UserId && r.ProductId == addReviewRequest.ProductId);
            if (existingReview != null)
            {
                throw new InvalidOperationException("User has already reviewed this product.");
            }

            var review = new Review
            {
                UserId = addReviewRequest.UserId,
                ProductId = addReviewRequest.ProductId,
                Rating = addReviewRequest.Rating,
                Comment = addReviewRequest.Comment,
                CreatedAt = DateTime.UtcNow,
            };
            await dbContext.Reviews.AddAsync(review);
            await dbContext.SaveChangesAsync();

            return review;
        }

        public async Task<Review?> UpdateReviewAsync(int reviewId, UpdateReviewRequestDTO request)
        {
            var review = await dbContext.Reviews.FindAsync(reviewId);
            if (review == null)
                return null;

            review.Rating = request.Rating;
            review.Comment = request.Comment;

            dbContext.Reviews.Update(review);
            await dbContext.SaveChangesAsync();

            return review;
        }

        public async Task<bool> DeleteReviewAsync(int reviewId)
        {
            var review = await dbContext.Reviews.FindAsync(reviewId);
            if (review == null)
                return false;

            dbContext.Reviews.Remove(review);
            return await dbContext.SaveChangesAsync() > 0;
        }
        
        public async Task<Review?> GetReviewByIdAsync(int id)
        {
            return await dbContext.Reviews
                .Include(r => r.User)
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.ReviewId == id);
        }

        public async Task<List<Review>> GetReviewsByProductIdAsync(int productId)
        {
            return await dbContext.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}