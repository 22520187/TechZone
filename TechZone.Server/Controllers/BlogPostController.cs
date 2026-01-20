using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogPostController : ControllerBase
    {
        private readonly IBlogPostRepository _blogPostRepository;
        private readonly IMapper _mapper;

        public BlogPostController(IBlogPostRepository blogPostRepository, IMapper mapper)
        {
            _blogPostRepository = blogPostRepository;
            _mapper = mapper;
        }

        // GET: api/BlogPost/GetAllBlogPosts (Admin/Staff)
        [HttpGet("GetAllBlogPosts")]
        public async Task<ActionResult> GetAllBlogPosts()
        {
            try
            {
                var blogPosts = await _blogPostRepository.GetAllBlogPostsAsync();
                var blogPostDTOs = blogPosts.Select(b => new BlogPostDTO
                {
                    BlogPostId = b.BlogPostId,
                    Title = b.Title,
                    Description = b.Description,
                    ImageUrl = b.ImageUrl,
                    Content = b.Content,
                    AuthorId = b.AuthorId,
                    AuthorName = b.Author?.FullName,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt
                }).ToList();

                return Ok(blogPostDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // GET: api/BlogPost/GetPublishedBlogPosts (Public)
        [HttpGet("GetPublishedBlogPosts")]
        public async Task<ActionResult> GetPublishedBlogPosts()
        {
            try
            {
                var blogPosts = await _blogPostRepository.GetPublishedBlogPostsAsync();
                var blogPostDTOs = blogPosts.Select(b => new BlogPostDTO
                {
                    BlogPostId = b.BlogPostId,
                    Title = b.Title,
                    Description = b.Description,
                    ImageUrl = b.ImageUrl,
                    Content = b.Content,
                    AuthorId = b.AuthorId,
                    AuthorName = b.Author?.FullName,
                    IsPublished = b.IsPublished,
                    CreatedAt = b.CreatedAt,
                    UpdatedAt = b.UpdatedAt
                }).ToList();

                return Ok(blogPostDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // GET: api/BlogPost/GetBlogPostById/5
        [HttpGet("GetBlogPostById/{id}")]
        public async Task<ActionResult> GetBlogPostById(int id)
        {
            try
            {
                var blogPost = await _blogPostRepository.GetBlogPostByIdAsync(id);
                if (blogPost == null)
                {
                    return NotFound("Blog post not found");
                }

                var blogPostDTO = new BlogPostDTO
                {
                    BlogPostId = blogPost.BlogPostId,
                    Title = blogPost.Title,
                    Description = blogPost.Description,
                    ImageUrl = blogPost.ImageUrl,
                    Content = blogPost.Content,
                    AuthorId = blogPost.AuthorId,
                    AuthorName = blogPost.Author?.FullName,
                    IsPublished = blogPost.IsPublished,
                    CreatedAt = blogPost.CreatedAt,
                    UpdatedAt = blogPost.UpdatedAt
                };

                return Ok(blogPostDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // POST: api/BlogPost/AddBlogPost
        [HttpPost("AddBlogPost")]
        public async Task<ActionResult> AddBlogPost([FromBody] AddBlogPostDTO addBlogPostDTO)
        {
            try
            {
                // Get AuthorId from JWT token claims
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int authorId))
                {
                    // Log for debugging
                    Console.WriteLine("User.Identity.IsAuthenticated: " + User.Identity?.IsAuthenticated);
                    Console.WriteLine("Claims count: " + User.Claims.Count());
                    foreach (var claim in User.Claims)
                    {
                        Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                    }
                    
                    return Unauthorized(new { 
                        message = "User not authenticated", 
                        isAuthenticated = User.Identity?.IsAuthenticated,
                        claimsCount = User.Claims.Count()
                    });
                }

                var blogPost = new BlogPost
                {
                    Title = addBlogPostDTO.Title,
                    Description = addBlogPostDTO.Description,
                    ImageUrl = addBlogPostDTO.ImageUrl,
                    Content = addBlogPostDTO.Content,
                    IsPublished = addBlogPostDTO.IsPublished,
                    AuthorId = authorId
                };

                var createdBlogPost = await _blogPostRepository.AddBlogPostAsync(blogPost);

                return CreatedAtAction(nameof(GetBlogPostById), 
                    new { id = createdBlogPost.BlogPostId }, 
                    _mapper.Map<BlogPostDTO>(createdBlogPost));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // PUT: api/BlogPost/UpdateBlogPost/5
        [HttpPut("UpdateBlogPost/{id}")]
        public async Task<ActionResult> UpdateBlogPost(int id, [FromBody] UpdateBlogPostDTO updateBlogPostDTO)
        {
            try
            {
                var blogPost = new BlogPost
                {
                    Title = updateBlogPostDTO.Title,
                    Description = updateBlogPostDTO.Description,
                    ImageUrl = updateBlogPostDTO.ImageUrl,
                    Content = updateBlogPostDTO.Content,
                    IsPublished = updateBlogPostDTO.IsPublished
                };

                var updatedBlogPost = await _blogPostRepository.UpdateBlogPostAsync(id, blogPost);
                if (updatedBlogPost == null)
                {
                    return NotFound("Blog post not found");
                }

                return Ok(_mapper.Map<BlogPostDTO>(updatedBlogPost));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // DELETE: api/BlogPost/DeleteBlogPost/5
        [HttpDelete("DeleteBlogPost/{id}")]
        public async Task<ActionResult> DeleteBlogPost(int id)
        {
            try
            {
                var deletedBlogPost = await _blogPostRepository.DeleteBlogPostAsync(id);
                if (deletedBlogPost == null)
                {
                    return NotFound("Blog post not found");
                }

                return Ok(new { message = "Blog post deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
