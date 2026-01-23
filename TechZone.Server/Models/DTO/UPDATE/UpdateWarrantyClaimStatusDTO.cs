namespace TechZone.Server.Models.DTO.UPDATE
{
    public class UpdateWarrantyClaimStatusDTO
    {
        public string Status { get; set; } = "PENDING";
        public string? AdminNotes { get; set; }
    }
}

