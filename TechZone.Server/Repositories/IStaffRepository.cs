using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Repositories
{
    public interface IStaffRepository
    {
        Task<List<User>> GetAllStaffAsync();
        Task<User?> GetStaffByIdAsync(int staffId);
        Task<User> AddStaffAsync(User staff);
        Task<bool> UpdateStaffAsync(int staffId, AdminUpdateStaffDTO staffDTO);
        Task<User?> DeleteStaffAsync(int staffId);
        Task<bool> IsEmailExistsAsync(string email);
    }
}
