using Microsoft.EntityFrameworkCore;
using System.Linq;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Repositories;

namespace TechZone.Server.Repositories.Implement;

public class SQLChatHistoryRepository : TechZoneRepository<ChatHistory>, IChatHistoryRepository
{
    private readonly TechZoneDbContext _context;

    public SQLChatHistoryRepository(TechZoneDbContext dbcontext) : base(dbcontext)
    {
        _context = dbcontext;
    }

    public async Task<ChatHistory> AddChatMessageAsync(ChatHistory chatHistory)
    {
        chatHistory.CreatedAt = DateTime.UtcNow;
        await _context.ChatHistories.AddAsync(chatHistory);
        await _context.SaveChangesAsync();
        return chatHistory;
    }

    public async Task<List<ChatHistory>> GetChatHistoryByUserIdAsync(int userId)
    {
        return await _context.ChatHistories
            .Where(ch => ch.UserId == userId)
            .OrderBy(ch => ch.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<ChatHistory>> GetRecentChatHistoryByUserIdAsync(int userId, int limit = 50)
    {
        return await _context.ChatHistories
            .Where(ch => ch.UserId == userId)
            .OrderByDescending(ch => ch.CreatedAt)
            .Take(limit)
            .OrderBy(ch => ch.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> DeleteChatHistoryByUserIdAsync(int userId)
    {
        var chatHistories = await _context.ChatHistories
            .Where(ch => ch.UserId == userId)
            .ToListAsync();
        
        if (chatHistories.Any())
        {
            _context.ChatHistories.RemoveRange(chatHistories);
            await _context.SaveChangesAsync();
            return true;
        }
        
        return false;
    }
}

