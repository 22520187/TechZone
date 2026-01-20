using System;
using System.Collections.Generic;

namespace TechZone.Server.Models.Domain;

public partial class BlogPost
{
    public int BlogPostId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? Content { get; set; }

    public int? AuthorId { get; set; }

    public bool IsPublished { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? Author { get; set; }
}
