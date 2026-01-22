using System;

namespace TechZone.Server.Models.Domain;

public partial class WarrantyClaim
{
    public int WarrantyClaimId { get; set; }

    public int WarrantyId { get; set; }

    public int? UserId { get; set; }

    public string IssueDescription { get; set; } = null!;

    public string? IssueImages { get; set; }

    public string Status { get; set; } = "PENDING";

    public string? AdminNotes { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public virtual Warranty? Warranty { get; set; }

    public virtual User? User { get; set; }
}

