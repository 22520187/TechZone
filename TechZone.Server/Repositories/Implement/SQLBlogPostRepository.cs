using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLBlogPostRepository : TechZoneRepository<BlogPost>, IBlogPostRepository
    {
        public SQLBlogPostRepository(TechZoneDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<BlogPost>> GetAllBlogPostsAsync()
        {
            return await dbContext.BlogPosts
                .Include(b => b.Author)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<BlogPost>> GetPublishedBlogPostsAsync()
        {
            return await dbContext.BlogPosts
                .Include(b => b.Author)
                .Where(b => b.IsPublished == true)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<BlogPost?> GetBlogPostByIdAsync(int blogPostId)
        {
            return await dbContext.BlogPosts
                .Include(b => b.Author)
                .FirstOrDefaultAsync(b => b.BlogPostId == blogPostId);
        }

        public async Task<BlogPost> AddBlogPostAsync(BlogPost blogPost)
        {
            blogPost.CreatedAt = DateTime.Now;
            blogPost.UpdatedAt = DateTime.Now;
            await dbContext.BlogPosts.AddAsync(blogPost);
            await dbContext.SaveChangesAsync();
            return blogPost;
        }

        public async Task<BlogPost?> UpdateBlogPostAsync(int blogPostId, BlogPost updatedBlogPost)
        {
            var existingBlogPost = await dbContext.BlogPosts.FindAsync(blogPostId);
            if (existingBlogPost == null)
            {
                return null;
            }

            existingBlogPost.Title = updatedBlogPost.Title;
            existingBlogPost.Description = updatedBlogPost.Description;
            existingBlogPost.ImageUrl = updatedBlogPost.ImageUrl;
            existingBlogPost.Content = updatedBlogPost.Content;
            existingBlogPost.IsPublished = updatedBlogPost.IsPublished;
            existingBlogPost.UpdatedAt = DateTime.Now;

            await dbContext.SaveChangesAsync();
            return existingBlogPost;
        }

        public async Task<BlogPost?> DeleteBlogPostAsync(int blogPostId)
        {
            var blogPost = await dbContext.BlogPosts.FindAsync(blogPostId);
            if (blogPost == null)
            {
                return null;
            }

            dbContext.BlogPosts.Remove(blogPost);
            await dbContext.SaveChangesAsync();
            return blogPost;
        }
    }
}
