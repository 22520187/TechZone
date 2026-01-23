namespace TechZone.Server.Models.DTO.ADD
{
    public class AddBlogPostDTO
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? Content { get; set; }
        public bool IsPublished { get; set; } = false;
    }
}
