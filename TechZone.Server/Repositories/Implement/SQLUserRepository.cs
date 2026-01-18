using Microsoft.EntityFrameworkCore;
using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Repositories;

namespace TechZone.Server.Repositories.Implement
{
    public class SQLUserRepository : TechZoneRepository<User>, IUserRepository
    {
        private readonly TechZoneDbContext _context;

        public SQLUserRepository(TechZoneDbContext dbcontext) : base(dbcontext)
        {
            _context = dbcontext;
        }

        public async Task<User> RegisterUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> AuthenticateAsync(string email, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
                return null;

            Console.WriteLine($"Hash value: {user.PasswordHash}");

            try
            {
                var isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                Console.WriteLine($"Password match: {isPasswordValid}");
                return isPasswordValid ? user : null;
            }
            catch (BCrypt.Net.SaltParseException ex)
            {
                // Log lỗi để dễ debug nếu có
                Console.WriteLine($"Invalid BCrypt hash: {user.PasswordHash}");
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }

        public async Task<ICollection<string>> GetUserRole(int userId)
        {
            var result = await _context.Users
                .Where(ur => ur.UserId == userId)
                .Select(ur => ur.Role)
                .ToListAsync();
            return result;
        }

        public async Task<bool> UpdatePasswordAsync(User user, string newPassword)
        {
            if (user == null || string.IsNullOrEmpty(newPassword))
                return false;

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.PasswordHash = hashedPassword;

            _context.Users.Update(user);
            var changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

        public async Task<bool> UpdateUserInfoAsync(int userId, UpdateUserInfoRequestDTO request)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return false;

                // Update only non-null fields
                if (request.FullName != null)
                    user.FullName = request.FullName;
                if (request.Phone != null)
                    user.Phone = request.Phone;
                if (request.District != null)
                    user.District = request.District;
                if (request.City != null)
                    user.City = request.City;
                if (request.Ward != null)
                    user.Ward = request.Ward;
                if (request.PhotoUrl != null)
                    user.AvatarImageUrl = request.PhotoUrl;

                _context.Users.Update(user);
                var result = await _context.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateUserInfo: {ex}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<bool> UpdateUserAsync(int userId, AdminUpdateUserDTO adminUpdateUserDTO)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.FullName = adminUpdateUserDTO.FullName;
            user.Phone = adminUpdateUserDTO.Phone;
            user.City = adminUpdateUserDTO.City;
            user.District = adminUpdateUserDTO.District;
            user.Ward = adminUpdateUserDTO.Ward;
            user.AvatarImageUrl = adminUpdateUserDTO.AvatarImageUrl;
            user.Role = adminUpdateUserDTO.Role ?? user.Role;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> DeleteUserAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Orders)
                .Include(u => u.Carts)
                .Include(u => u.Reviews)
                .Include(u => u.ChatHistories)
                .Include(u => u.WarrantyClaims)
                .FirstOrDefaultAsync(u => u.UserId == userId);
            
            if (user == null) return null;

            // Check if user has any related data
            if (user.Orders.Any())
            {
                throw new InvalidOperationException("Cannot delete user with existing orders. Please contact system administrator.");
            }

            // Delete related data first
            if (user.Carts.Any())
            {
                _context.Carts.RemoveRange(user.Carts);
            }
            if (user.Reviews.Any())
            {
                _context.Reviews.RemoveRange(user.Reviews);
            }
            if (user.ChatHistories.Any())
            {
                _context.ChatHistories.RemoveRange(user.ChatHistories);
            }
            if (user.WarrantyClaims.Any())
            {
                _context.WarrantyClaims.RemoveRange(user.WarrantyClaims);
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}