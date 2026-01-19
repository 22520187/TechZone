using TechZone.Server.Models;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.UPDATE;


namespace TechZone.Server.Repositories.Implement
{
    public class SQLStaffRepository : IStaffRepository
    {
        private readonly TechZoneDbContext _context;

        public SQLStaffRepository(TechZoneDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllStaffAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "staff" || u.Role == "Staff")
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<User?> GetStaffByIdAsync(int staffId)
        {
            return await _context.Users
                .Where(u => (u.Role == "staff" || u.Role == "Staff") && u.UserId == staffId)
                .FirstOrDefaultAsync();
        }

        public async Task<User> AddStaffAsync(User staff)
        {
            staff.Role = "staff";
            staff.CreatedAt = DateTime.Now;
            
            // Hash password
            if (!string.IsNullOrEmpty(staff.PasswordHash))
            {
                staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(staff.PasswordHash);
            }
            
            await _context.Users.AddAsync(staff);
            await _context.SaveChangesAsync();
            return staff;
        }

        public async Task<bool> UpdateStaffAsync(int staffId, AdminUpdateStaffDTO staffDTO)
        {
            var staff = await GetStaffByIdAsync(staffId);
            if (staff == null) return false;

            staff.FullName = staffDTO.FullName ?? staff.FullName;
            staff.Phone = staffDTO.Phone ?? staff.Phone;
            staff.City = staffDTO.City ?? staff.City;
            staff.District = staffDTO.District ?? staff.District;
            staff.Ward = staffDTO.Ward ?? staff.Ward;
            staff.AvatarImageUrl = staffDTO.AvatarImageUrl ?? staff.AvatarImageUrl;

            _context.Users.Update(staff);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> DeleteStaffAsync(int staffId)
        {
            var staff = await _context.Users
                .Where(u => (u.Role == "staff" || u.Role == "Staff") && u.UserId == staffId)
                .Include(u => u.Orders)
                .Include(u => u.Carts)
                .Include(u => u.Reviews)
                .Include(u => u.ChatHistories)
                .Include(u => u.WarrantyClaims)
                .FirstOrDefaultAsync();

            if (staff == null)
            {
                return null;
            }

            if (staff.Orders.Any() || 
                staff.Reviews.Any() || 
                staff.ChatHistories.Any() || 
                staff.WarrantyClaims.Any())
            {
                throw new InvalidOperationException(
                    "Cannot delete staff with existing orders, reviews, chat histories, or warranty claims"
                );
            }

            // Remove any carts associated with staff (staff shouldn't have carts, but clean up if they do)
            if (staff.Carts.Any())
            {
                _context.Carts.RemoveRange(staff.Carts);
            }

            _context.Users.Remove(staff);
            await _context.SaveChangesAsync();
            return staff;
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}
