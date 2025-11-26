using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatHistoryRepository _chatHistoryRepository;
        private readonly IMapper _mapper;

        public ChatbotController(IChatHistoryRepository chatHistoryRepository, IMapper mapper)
        {
            _chatHistoryRepository = chatHistoryRepository;
            _mapper = mapper;
        }

        [HttpPost("SaveMessage")]
        public async Task<ActionResult> SaveMessage([FromBody] AddChatMessageDTO addChatMessageDTO)
        {
            try
            {
                var chatHistory = _mapper.Map<ChatHistory>(addChatMessageDTO);
                var savedChat = await _chatHistoryRepository.AddChatMessageAsync(chatHistory);
                var chatHistoryDTO = _mapper.Map<ChatHistoryDTO>(savedChat);
                return Ok(chatHistoryDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetChatHistory/{userId}")]
        public async Task<ActionResult> GetChatHistory(int userId)
        {
            try
            {
                var chatHistories = await _chatHistoryRepository.GetChatHistoryByUserIdAsync(userId);
                var chatHistoryDTOs = _mapper.Map<List<ChatHistoryDTO>>(chatHistories);
                return Ok(chatHistoryDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("GetRecentChatHistory/{userId}")]
        public async Task<ActionResult> GetRecentChatHistory(int userId, [FromQuery] int limit = 50)
        {
            try
            {
                var chatHistories = await _chatHistoryRepository.GetRecentChatHistoryByUserIdAsync(userId, limit);
                var chatHistoryDTOs = _mapper.Map<List<ChatHistoryDTO>>(chatHistories);
                return Ok(chatHistoryDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete("DeleteChatHistory/{userId}")]
        public async Task<ActionResult> DeleteChatHistory(int userId)
        {
            try
            {
                var result = await _chatHistoryRepository.DeleteChatHistoryByUserIdAsync(userId);
                if (result)
                {
                    return Ok(new { message = "Chat history deleted successfully" });
                }
                return NotFound(new { message = "No chat history found for this user" });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}

