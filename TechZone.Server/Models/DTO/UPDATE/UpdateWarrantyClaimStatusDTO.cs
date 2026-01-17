namespace TechZone.Server.Models.DTO.UPDATE
{
    public class UpdateWarrantyClaimStatusDTO
    {
        public string Status { get; set; } = "Pending";
        public string? AdminNotes { get; set; }
    }
}

