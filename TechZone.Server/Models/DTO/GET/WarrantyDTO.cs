namespace TechZone.Server.Models.DTO.GET
{
    public class WarrantyDTO
    {
        public int WarrantyId { get; set; }
        public int OrderDetailId { get; set; }
        public int? ProductId { get; set; }
        public int WarrantyPeriodMonths { get; set; }
        public string WarrantyType { get; set; } = "Standard";
        public string? WarrantyDescription { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string Status { get; set; } = "Active";
        
        // Related data
        public CustomerProductDTO? Product { get; set; }
        public OrderDetailDTO? OrderDetail { get; set; }
        public List<WarrantyClaimDTO> WarrantyClaims { get; set; } = new();
    }
}

