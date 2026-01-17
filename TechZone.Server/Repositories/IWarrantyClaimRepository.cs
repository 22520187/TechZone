using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IWarrantyClaimRepository : ITechZoneRepository<WarrantyClaim>
    {
        Task<WarrantyClaim?> GetWarrantyClaimByIdAsync(int warrantyClaimId);
        Task<List<WarrantyClaim>> GetWarrantyClaimsByUserIdAsync(int userId);
        Task<List<WarrantyClaim>> GetWarrantyClaimsByWarrantyIdAsync(int warrantyId);
        Task<List<WarrantyClaim>> GetAllWarrantyClaimsAsync();
        Task<bool> UpdateWarrantyClaimStatusAsync(int warrantyClaimId, string status, string? adminNotes = null);
    }
}

