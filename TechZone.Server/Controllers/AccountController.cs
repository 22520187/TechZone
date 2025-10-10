using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Repositories;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.RequestModels;
using TechZone.Server.Models.DTO;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AccountController(IUserRepository userRepository, IMemoryCache cache, ITokenService tokenService) : ControllerBase
    {
        private readonly IUserRepository userRepository = userRepository;
        private readonly ITokenService _tokenService = tokenService;
        // private readonly IMapper _mapper = mapper;
        private readonly IMemoryCache _memoryCache = cache;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequests request)
        {
            // Kiểm tra email đã tồn tại chưa
            bool isEmailExits = await userRepository.IsEmailExistsAsync(request.Email);
            if (isEmailExits)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email already exists."
                });
            }

            var hashPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = new User
            {
                Email = request.Email,
                PasswordHash = hashPassword
            };

            var result = await userRepository.RegisterUserAsync(user);
            return Ok(result);
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequests request)
        {
            var user = await userRepository.AuthenticateAsync(request.Email, request.Password);
            if (user != null)
            {
                var role = await userRepository.GetUserRole(user.UserId);
                if (role != null)
                {
                    // create token
                    var jwttoken = tokenService.CreateJWTToken(user, role.ToList());
                    var loginResponse = new LoginRespondDto
                    {
                        UserId = user.UserId,
                        JwtToken = jwttoken,
                    };
                    return Ok(loginResponse);
                }
            }
            return BadRequest("Username or password incorrect");
        }

        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email, CurrentPassword, and NewPassword are required."
                });
            }
            try
            {
                var userToChangePassword = await userRepository.GetUserByEmailAsync(request.Email);

                if (userToChangePassword == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "User not found."
                    });
                }

                // Verify current password
                bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, userToChangePassword.PasswordHash);
                if (!isCurrentPasswordValid)
                {
                    return BadRequest(new
                    {
                        status = "error",
                        message = "Current password is incorrect."
                    });
                }

                // Hash the new password
                var hashPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                await userRepository.UpdatePasswordAsync(userToChangePassword, hashPassword);

                return Ok(new
                {
                    status = "success",
                    message = "Password changed successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "An error occurred while changing the password.",
                    details = ex.Message
                });
            }
        }

        [HttpPost("validateUser")]
        public async Task<IActionResult> ValidateUser([FromBody] LoginRequests request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email, Password is not empty."
                });
            }

            try
            {
                var user = await userRepository.AuthenticateAsync(request.Email, request.Password);
                if (user == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "Email or Password is incorrect."
                    });
                }
                return Ok(new
                {
                    status = "success",
                    message = "User is valid."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = ex.Message
                });
            }
        }
    }
}