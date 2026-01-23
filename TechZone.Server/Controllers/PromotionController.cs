using AutoMapper;
using TechZone.Server.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionController : ControllerBase
    {
        private readonly IPromotionRepository _promotionRepository;
        private readonly IMapper _mapper;

        public PromotionController(IPromotionRepository promotionRepository, IMapper mapper)
        {
            _promotionRepository = promotionRepository;
            _mapper = mapper;
        }

        [HttpGet("CustomerGetAllAvailablePromotion")]
        public async Task<ActionResult> CustomerGetAllAvailablePromotion()
        {
            try
            {
                var promotions = await _promotionRepository.CustomerGetAllAvailablePromotionAsync();
                return Ok(_mapper.Map<List<CustomerPromotionDTO>>(promotions));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("AdminGetAllPromotions")]
        public async Task<ActionResult> AdminGetAllPromotions()
        {
            try
            {
                var promotions = await _promotionRepository.AdminGetAllPromotionsAsync();
                if (promotions == null || promotions.Count == 0)
                {
                    return NotFound("No promotions found");
                }
                return Ok(_mapper.Map<List<AdminPromotionDTO>>(promotions));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("AdminGetPromotionById/{id}")]
        public async Task<ActionResult> AdminGetPromotionById(int id)
        {
            try
            {
                var promotion = await _promotionRepository.AdminGetPromotionByIdAsync(id);
                if (promotion == null)
                {
                    return NotFound("Promotion not found");
                }
                return Ok(_mapper.Map<AdminPromotionDTO>(promotion));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("AddPromotion")]
        public async Task<ActionResult> AddPromotion([FromBody] AdminAddPromotionDTO adminAddPromotionDTO)
        {
            try
            {
                if (adminAddPromotionDTO == null)
                {
                    return BadRequest("Invalid promotion data.");
                }
                var promotion = _mapper.Map<Promotion>(adminAddPromotionDTO);
                var addedPromotion = await _promotionRepository.AddPromotionAsync(promotion);
                await _promotionRepository.LinkProductsToPromotionAsync(addedPromotion, adminAddPromotionDTO.ProductIDs);
                return Ok(_mapper.Map<AdminPromotionDTO>(addedPromotion));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPut("UpdatePromotion/{id}")]
        public async Task<ActionResult> UpdatePromotion(int id, [FromBody] AdminUpdatePromotionDTO adminUpdatePromotionDTO)
        {
            try
            {
                if (adminUpdatePromotionDTO == null)
                {
                    return BadRequest("Invalid promotion data.");
                }
                var updatedPromotion = _mapper.Map<Promotion>(adminUpdatePromotionDTO);
                var promotion = await _promotionRepository.UpdatePromotionAsync(id, updatedPromotion);
                if (promotion == null)
                {
                    return NotFound("Promotion not found");
                }
                await _promotionRepository.LinkProductsToPromotionAsync(promotion, adminUpdatePromotionDTO.ProductIDs);
                return Ok(_mapper.Map<AdminPromotionDTO>(await _promotionRepository.AdminGetPromotionByIdAsync(id)));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete("DeletePromotion/{id}")]
        public async Task<ActionResult> DeletePromotion(int id)
        {
            try
            {
                var promotion = await _promotionRepository.DeletePromotionAsync(id);
                if (promotion == null)
                {
                    return NotFound("Promotion not found");
                }
                return Ok(_mapper.Map<AdminPromotionDTO>(promotion));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPatch("UpdatePromotionStatus/{id}")]
        public async Task<ActionResult> UpdatePromotionStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Status))
                {
                    return BadRequest("Status is required.");
                }

                var promotion = await _promotionRepository.UpdatePromotionStatusAsync(id, request.Status);
                if (promotion == null)
                {
                    return NotFound("Promotion not found");
                }
                return Ok(_mapper.Map<AdminPromotionDTO>(promotion));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost("ValidatePromotionCode")]
        public async Task<ActionResult> ValidatePromotionCode([FromBody] ValidatePromotionCodeRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PromotionCode))
                {
                    return BadRequest("Promotion code is required.");
                }

                var promotion = await _promotionRepository.ValidatePromotionCodeAsync(request.PromotionCode);
                if (promotion == null)
                {
                    return NotFound("Promotion code is invalid or has expired.");
                }
                
                return Ok(_mapper.Map<CustomerPromotionDTO>(promotion));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; }
    }

    public class ValidatePromotionCodeRequest
    {
        public string PromotionCode { get; set; }
    }
}