using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Repositories
{
    public interface IReviewRepository : ITechZoneRepository<Review>
    {
        Task<Review> AddReviewAsync(AddReviewRequestDTO addReviewRequest);
        Task<Review?> UpdateReviewAsync(int reviewId, UpdateReviewRequestDTO updateReviewRequest);
        Task<bool> DeleteReviewAsync(int reviewId);
        Task<Review?> GetReviewByIdAsync(int id);
        Task<List<Review>> GetReviewsByProductIdAsync(int productId);
    }
}
