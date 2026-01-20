using TechZone.Server.Services.Models;

namespace TechZone.Server.Services;

public interface IChatbotKnowledgeService
{
    /// <summary>
    /// Trả lời dựa trên database (không gọi API ngoài). Nếu không đủ dữ liệu để trả lời, trả về null.
    /// </summary>
    Task<string?> TryAnswerFromDatabaseAsync(string message, int? userId);

    /// <summary>
    /// Tạo "context" từ database để dùng cho chế độ hybrid (LLM có ngữ cảnh nội bộ).
    /// </summary>
    Task<string> BuildDatabaseContextAsync(string message, int? userId, int maxProducts = 5, int maxOrders = 3);
}


