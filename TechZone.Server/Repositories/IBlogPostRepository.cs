using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories
{
    public interface IBlogPostRepository : ITechZoneRepository<BlogPost>
    {
        Task<List<BlogPost>> GetAllBlogPostsAsync();
        Task<List<BlogPost>> GetPublishedBlogPostsAsync();
        Task<BlogPost?> GetBlogPostByIdAsync(int blogPostId);
        Task<BlogPost> AddBlogPostAsync(BlogPost blogPost);
        Task<BlogPost?> UpdateBlogPostAsync(int blogPostId, BlogPost updatedBlogPost);
        Task<BlogPost?> DeleteBlogPostAsync(int blogPostId);
    }
}
