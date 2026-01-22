using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WarrantyClaimController : ControllerBase
    {
        private readonly IWarrantyClaimRepository _warrantyClaimRepository;
        private readonly IWarrantyRepository _warrantyRepository;
        private readonly IMapper _mapper;

        public WarrantyClaimController(
            IWarrantyClaimRepository warrantyClaimRepository,
            IWarrantyRepository warrantyRepository,
            IMapper mapper)
        {
            _warrantyClaimRepository = warrantyClaimRepository;
            _warrantyRepository = warrantyRepository;
            _mapper = mapper;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult> GetWarrantyClaimsByUserId(int userId)
        {
            var warrantyClaims = await _warrantyClaimRepository.GetWarrantyClaimsByUserIdAsync(userId);
            if (warrantyClaims == null || warrantyClaims.Count == 0)
            {
                return Ok(new List<WarrantyClaimDTO>());
            }

            var warrantyClaimDTOs = _mapper.Map<List<WarrantyClaimDTO>>(warrantyClaims);
            return Ok(warrantyClaimDTOs);
        }

        [HttpGet("{warrantyClaimId}")]
        public async Task<ActionResult> GetWarrantyClaimById(int warrantyClaimId)
        {
            var warrantyClaim = await _warrantyClaimRepository.GetWarrantyClaimByIdAsync(warrantyClaimId);
            if (warrantyClaim == null)
            {
                return NotFound(new { Message = "Warranty claim not found." });
            }

            var warrantyClaimDTO = _mapper.Map<WarrantyClaimDTO>(warrantyClaim);
            return Ok(warrantyClaimDTO);
        }

        [HttpGet("warranty/{warrantyId}")]
        public async Task<ActionResult> GetWarrantyClaimsByWarrantyId(int warrantyId)
        {
            var warrantyClaims = await _warrantyClaimRepository.GetWarrantyClaimsByWarrantyIdAsync(warrantyId);
            if (warrantyClaims == null || warrantyClaims.Count == 0)
            {
                return Ok(new List<WarrantyClaimDTO>());
            }

            var warrantyClaimDTOs = _mapper.Map<List<WarrantyClaimDTO>>(warrantyClaims);
            return Ok(warrantyClaimDTOs);
        }

        [HttpGet("all")]
        public async Task<ActionResult> GetAllWarrantyClaims()
        {
            var warrantyClaims = await _warrantyClaimRepository.GetAllWarrantyClaimsAsync();
            if (warrantyClaims == null || warrantyClaims.Count == 0)
            {
                return Ok(new List<WarrantyClaimDTO>());
            }

            var warrantyClaimDTOs = _mapper.Map<List<WarrantyClaimDTO>>(warrantyClaims);
            return Ok(warrantyClaimDTOs);
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateWarrantyClaim([FromBody] AddWarrantyClaimDTO addWarrantyClaimDTO)
        {
            try
            {
                // Verify warranty exists and is active
                var warranty = await _warrantyRepository.GetWarrantyByIdAsync(addWarrantyClaimDTO.WarrantyId);
                if (warranty == null)
                {
                    return NotFound(new { Message = "Warranty not found." });
                }

                if (warranty.Status != "Active")
                {
                    return BadRequest(new { Message = "Warranty is not active." });
                }

                if (warranty.EndDate < DateTime.UtcNow)
                {
                    return BadRequest(new { Message = "Warranty has expired." });
                }

                // Convert image URLs list to JSON string
                string? issueImagesJson = null;
                if (addWarrantyClaimDTO.IssueImageUrls != null && addWarrantyClaimDTO.IssueImageUrls.Count > 0)
                {
                    issueImagesJson = JsonSerializer.Serialize(addWarrantyClaimDTO.IssueImageUrls);
                }

                var warrantyClaim = new WarrantyClaim
                {
                    WarrantyId = addWarrantyClaimDTO.WarrantyId,
                    UserId = addWarrantyClaimDTO.UserId,
                    IssueDescription = addWarrantyClaimDTO.IssueDescription,
                    IssueImages = issueImagesJson,
                    Status = "PENDING",
                    SubmittedAt = DateTime.UtcNow
                };

                var createdClaim = await _warrantyClaimRepository.CreateAsync(warrantyClaim);
                var warrantyClaimDTO = _mapper.Map<WarrantyClaimDTO>(createdClaim);
                return CreatedAtAction(nameof(GetWarrantyClaimById), new { warrantyClaimId = createdClaim.WarrantyClaimId }, warrantyClaimDTO);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("status/{warrantyClaimId}")]
        public async Task<ActionResult> UpdateWarrantyClaimStatus(int warrantyClaimId, [FromBody] UpdateWarrantyClaimStatusDTO updateDTO)
        {
            var result = await _warrantyClaimRepository.UpdateWarrantyClaimStatusAsync(
                warrantyClaimId, 
                updateDTO.Status, 
                updateDTO.AdminNotes);

            if (!result)
            {
                return NotFound(new { Message = $"Warranty claim with ID {warrantyClaimId} not found." });
            }

            return NoContent();
        }
    }
}

