namespace TechZone.Server.Models.DTO.UPDATE
{
    public class UpdateBlogPostDTO
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Content { get; set; }
        public bool IsPublished { get; set; }
    }
}
