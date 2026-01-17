namespace TechZone.Server.Models.DTO.ADD
{
    public class AddWarrantyClaimDTO
    {
        public int WarrantyId { get; set; }
        public int? UserId { get; set; }
        public string IssueDescription { get; set; } = null!;
        public List<string>? IssueImageUrls { get; set; }
    }
}

