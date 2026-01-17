using System;
using System.Collections.Generic;

namespace TechZone.Server.Models.Domain;

public partial class Warranty
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

    public virtual OrderDetail? OrderDetail { get; set; }

    public virtual Product? Product { get; set; }

    public virtual ICollection<WarrantyClaim> WarrantyClaims { get; set; } = new List<WarrantyClaim>();
}

