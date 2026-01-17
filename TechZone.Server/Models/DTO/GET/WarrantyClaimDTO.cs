namespace TechZone.Server.Models.DTO.GET
{
    public class WarrantyClaimDTO
    {
        public int WarrantyClaimId { get; set; }
        public int WarrantyId { get; set; }
        public int? UserId { get; set; }
        public string IssueDescription { get; set; } = null!;
        public string? IssueImages { get; set; }
        public string Status { get; set; } = "Pending";
        public string? AdminNotes { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        
        // Related data
        public WarrantyDTO? Warranty { get; set; }
        public UserInfoDTO? User { get; set; }
    }
}

