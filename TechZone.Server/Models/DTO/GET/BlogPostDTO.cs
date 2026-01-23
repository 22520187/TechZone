namespace TechZone.Server.Models.DTO.GET
{
    public class BlogPostDTO
    {
        public int BlogPostId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Content { get; set; }
        public int? AuthorId { get; set; }
        public string? AuthorName { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
