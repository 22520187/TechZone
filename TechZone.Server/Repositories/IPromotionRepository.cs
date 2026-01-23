using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IPromotionRepository : ITechZoneRepository<Promotion>
    {
        Task<List<Promotion>> CustomerGetAllAvailablePromotionAsync();
        Task<List<Promotion>> AdminGetAllPromotionsAsync();
        Task<Promotion> AdminGetPromotionByIdAsync(int id);    
        Task<Promotion> AddPromotionAsync(Promotion promotion);
        Task LinkProductsToPromotionAsync(Promotion promotion, ICollection<string> productIds);
        Task<Promotion> DeletePromotionAsync(int id);
        Task<Promotion?> UpdatePromotionAsync(int promotionId, Promotion updatedPromotion);
        Task<Promotion?> UpdatePromotionStatusAsync(int promotionId, string status);
        Task<string> GetVoucherCodeByPromotionId(int PromotionId);
        Task<Promotion?> ValidatePromotionCodeAsync(string promotionCode);
    }
}