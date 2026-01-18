using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Repositories
{
    public interface IUserRepository : ITechZoneRepository<User>
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> RegisterUserAsync(User user);
        Task<bool> IsEmailExistsAsync(string email);
        Task<User?> AuthenticateAsync(string email, string password);
        Task<User?> GetUserByIdAsync(int userId);
        Task<ICollection<string>> GetUserRole(int userId);
        Task<List<User>> GetAllUsersAsync();
        Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDTO adminUpdateUserDTO);
        Task<User?> DeleteUserAsync(int userId);
        Task<bool> UpdatePasswordAsync(User user, string newPassword);

        Task<bool> UpdateUserInfoAsync(int userId, UpdateUserInfoRequestDTO request);
    }
}