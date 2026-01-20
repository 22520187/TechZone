using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;
using TechZone.Server.Services;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatHistoryRepository _chatHistoryRepository;
        private readonly IMapper _mapper;
        private readonly IOpenAIService _openAIService;
        private readonly IChatbotKnowledgeService _knowledgeService;
        private readonly IConfiguration _configuration;

        public ChatbotController(
            IChatHistoryRepository chatHistoryRepository, 
            IMapper mapper,
            IOpenAIService openAIService,
            IChatbotKnowledgeService knowledgeService,
            IConfiguration configuration)
        {
            _chatHistoryRepository = chatHistoryRepository;
            _mapper = mapper;
            _openAIService = openAIService;
            _knowledgeService = knowledgeService;
            _configuration = configuration;
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

        [HttpPost("Chat")]
        public async Task<ActionResult> Chat([FromBody] ChatRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest(new { error = "Message is required" });
                }

                // Mode: DatabaseOnly | Hybrid | ExternalOnly (default: DatabaseOnly for safety)
                var mode = (_configuration["Chatbot:Mode"] ?? "Hybrid").Trim();

                // Get conversation history for context if userId is provided
                List<(string role, string content)>? conversationHistory = null;
                
                if (request.UserId.HasValue)
                {
                    var chatHistories = await _chatHistoryRepository.GetRecentChatHistoryByUserIdAsync(
                        request.UserId.Value, 
                        request.HistoryLimit ?? 5
                    );

                    conversationHistory = chatHistories
                        .SelectMany(ch => new List<(string role, string content)>
                        {
                            ("user", ch.Message ?? ""),
                            ("bot", ch.Response ?? "")
                        })
                        .Where(item => !string.IsNullOrEmpty(item.content))
                        .ToList();
                }

                string aiResponse;

                if (mode.Equals("DatabaseOnly", StringComparison.OrdinalIgnoreCase))
                {
                    // Database-only mode is kept for debugging, but default behavior should be Hybrid (OpenAI grounded by DB).
                    aiResponse = await _knowledgeService.TryAnswerFromDatabaseAsync(request.Message, request.UserId)
                                 ?? "Mình chưa có đủ dữ liệu trong hệ thống để trả lời câu hỏi này từ database TechZone.";
                }
                else if (mode.Equals("Hybrid", StringComparison.OrdinalIgnoreCase))
                {
                    // Always use OpenAI, but STRICTLY grounded by internal DB context (RAG-style).
                    var dbContext = await _knowledgeService.BuildDatabaseContextAsync(request.Message, request.UserId);

                    var strictSystemPrompt =
                        "Bạn là TechZone AI Assistant.\n" +
                        "QUY TẮC BẮT BUỘC:\n" +
                        "- Chỉ được dùng dữ liệu trong phần 'Dữ liệu nội bộ TechZone (trích từ database)' để trả lời.\n" +
                        "- Không được bịa, không suy đoán, không lấy dữ liệu bên ngoài.\n" +
                        "- Nếu thiếu dữ liệu để trả lời (ví dụ không có giá/không thấy sản phẩm), hãy nói rõ: 'Không có dữ liệu trong hệ thống TechZone để trả lời câu này' và gợi ý người dùng cung cấp thông tin.\n" +
                        "- Trả lời ngắn gọn, đúng trọng tâm, tiếng Việt.\n\n" +
                        dbContext;

                    aiResponse = await _openAIService.GenerateResponseWithContextAsync(
                        request.Message,
                        strictSystemPrompt,
                        conversationHistory
                    );
                }
                else // ExternalOnly
                {
                    // Generate AI response using OpenAI
                    aiResponse = await _openAIService.GenerateResponseAsync(
                        request.Message,
                        conversationHistory
                    );
                }

                // Save to database if userId is provided
                if (request.UserId.HasValue)
                {
                    var chatHistory = new ChatHistory
                    {
                        UserId = request.UserId.Value,
                        Message = request.Message,
                        Response = aiResponse,
                        MessageType = "conversation",
                        CreatedAt = DateTime.UtcNow
                    };

                    await _chatHistoryRepository.AddChatMessageAsync(chatHistory);
                }

                return Ok(new ChatResponseDto
                {
                    Response = aiResponse,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Chat endpoint: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { 
                    error = "An error occurred while processing your request",
                    details = ex.Message 
                });
            }
        }
    }

    // DTOs for Chat endpoint
    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public int? HistoryLimit { get; set; } = 5;
    }

    public class ChatResponseDto
    {
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}

