using TechZone.Server.Models.Domain;

namespace TechZone.Server.Repositories;

public interface IChatHistoryRepository : ITechZoneRepository<ChatHistory>
{
    Task<ChatHistory> AddChatMessageAsync(ChatHistory chatHistory);
    
    Task<List<ChatHistory>> GetChatHistoryByUserIdAsync(int userId);
    
    Task<List<ChatHistory>> GetRecentChatHistoryByUserIdAsync(int userId, int limit = 50);
    
    Task<bool> DeleteChatHistoryByUserIdAsync(int userId);
}

