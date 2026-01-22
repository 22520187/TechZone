using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLWarrantyClaimRepository : TechZoneRepository<WarrantyClaim>, IWarrantyClaimRepository
    {
        private readonly TechZoneDbContext _context;

        public SQLWarrantyClaimRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task<WarrantyClaim?> GetWarrantyClaimByIdAsync(int warrantyClaimId)
        {
            return await _context.WarrantyClaims
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.OrderDetail)
                        .ThenInclude(od => od.ProductColor)
                            .ThenInclude(pc => pc.Product)
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.Product)
                .Include(wc => wc.User)
                .FirstOrDefaultAsync(wc => wc.WarrantyClaimId == warrantyClaimId);
        }

        public async Task<List<WarrantyClaim>> GetWarrantyClaimsByUserIdAsync(int userId)
        {
            return await _context.WarrantyClaims
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.OrderDetail)
                        .ThenInclude(od => od.ProductColor)
                            .ThenInclude(pc => pc.Product)
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.Product)
                .Include(wc => wc.User)
                .Where(wc => wc.UserId == userId)
                .OrderByDescending(wc => wc.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<WarrantyClaim>> GetWarrantyClaimsByWarrantyIdAsync(int warrantyId)
        {
            return await _context.WarrantyClaims
                .Include(wc => wc.Warranty)
                .Include(wc => wc.User)
                .Where(wc => wc.WarrantyId == warrantyId)
                .OrderByDescending(wc => wc.SubmittedAt)
                .ToListAsync();
        }

        public async Task<List<WarrantyClaim>> GetAllWarrantyClaimsAsync()
        {
            return await _context.WarrantyClaims
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.OrderDetail)
                        .ThenInclude(od => od.ProductColor)
                            .ThenInclude(pc => pc.Product)
                .Include(wc => wc.Warranty)
                    .ThenInclude(w => w.Product)
                .Include(wc => wc.User)
                .OrderByDescending(wc => wc.SubmittedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateWarrantyClaimStatusAsync(int warrantyClaimId, string status, string? adminNotes = null)
        {
            var warrantyClaim = await _context.WarrantyClaims.FindAsync(warrantyClaimId);
            if (warrantyClaim == null)
            {
                return false;
            }

            warrantyClaim.Status = status;
            if (adminNotes != null)
            {
                warrantyClaim.AdminNotes = adminNotes;
            }

            if (status == "COMPLETED" || status == "REJECTED")
            {
                warrantyClaim.ResolvedAt = DateTime.UtcNow;
            }

            _context.WarrantyClaims.Update(warrantyClaim);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

