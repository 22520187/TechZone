using AutoMapper;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Repositories;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.DTO.GET;
using System.Linq.Expressions;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        // private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly IReviewRepository _reviewRepository;

        public ReviewController(IUserRepository userRepository, IMapper mapper, IReviewRepository reviewRepository)
        {
            _userRepository = userRepository;
            // _productRepository = productRepository;
            _mapper = mapper;
            _reviewRepository = reviewRepository;
        }

        // Thêm đánh giá mới
        [HttpPost("add")]
        public async Task<IActionResult> AddReview([FromBody] AddReviewRequestDTO request)
        {
            // Validate input
            if (request == null)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Request data is required"
                });
            }

            if (request.UserId <= 0)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Valid User ID is required"
                });
            }

            if (request.ProductId <= 0)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Valid Product ID is required"
                });
            }

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Rating must be between 1 and 5"
                });
            }

            try
            {
                var review = await _reviewRepository.AddReviewAsync(request);
                return Ok(new
                {
                    status = "success",
                    message = "Review has been submitted successfully",
                    data = review
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = "An unexpected error occurred while submitting the review",
                    details = ex.Message
                });
            }
        }

        // Cập nhật đánh giá
        [HttpPut("update/{reviewId}")]
        public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] UpdateReviewRequestDTO request)
        {

            if (request.Rating < 1 || request.Rating > 5)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Rating must be between 1 and 5"
                });
            }

            var updatedReview = await _reviewRepository.UpdateReviewAsync(reviewId, request);
            if (updatedReview == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = $"Review with ID {reviewId} not found"
                });
            }

            return Ok(new
            {
                status = "success",
                message = "Review has been updated successfully",
                data = updatedReview
            });
        }

        // Xóa đánh giá
        [HttpDelete("delete/{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            var success = await _reviewRepository.DeleteReviewAsync(reviewId);
            if (!success)
            {
                return NotFound(new
                {
                    status = "error",
                    message = $"Review with ID {reviewId} not found"
                });
            }

            return Ok(new
            {
                status = "success",
                message = "Review has been deleted successfully"
            });
        }

        // Lấy đánh giá theo ID
        [HttpGet("{reviewId}")]
        public async Task<IActionResult> GetReviewById(int reviewId)
        {
            var review = await _reviewRepository.GetReviewByIdAsync(reviewId);

            if (review == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "Không tìm thấy đánh giá."
                });
            }

            var reviewDto = _mapper.Map<ReviewDTO>(review);

            return Ok(new
            {
                status = "success",
                message = "Lấy đánh giá thành công.",
                data = reviewDto
            });
        }

        // Lấy đánh giá theo ProductId
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsByProductId(int productId)
        {
            try
            {
                var reviews = await _reviewRepository.GetReviewsByProductIdAsync(productId);
                var reviewDTOs = _mapper.Map<List<ReviewDTO>>(reviews);

                return Ok(new
                {
                    status = "success",
                    message = "Reviews retrieved successfully.",
                    data = reviewDTOs
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = "error",
                    message = "An error occurred while retrieving reviews.",
                    details = ex.Message
                });
            }

        }

    }
}