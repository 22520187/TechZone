using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Repositories;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.RequestModels;
using TechZone.Server.Models.DTO;
using TechZone.Server.Services;
using System.Runtime.CompilerServices;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.UPDATE;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AccountController(IUserRepository userRepository, IMemoryCache cache, ITokenService tokenService, IMapper mapper) : ControllerBase
    {
        private readonly IUserRepository userRepository = userRepository;
        private readonly ITokenService tokenService = tokenService;
        private readonly IMapper _mapper = mapper;
        private readonly IMemoryCache _cache = cache;

        private readonly EmailService _emailService = new EmailService();

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

        [HttpPost("send-verification-code/{email}")]
        public async Task<IActionResult> SendVerificationCode(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email is required."
                });
            }

            try
            {
                var code = await _emailService.SendVerificationCodeAsync(email);
                _cache.Set(email, code, TimeSpan.FromMinutes(5)); // Lưu mã vào cache trong 5 phút

                return Ok(new
                {
                    status = "success",
                    message = "Verification code sent to email."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Failed to send verification code.",
                    details = ex.Message
                });
            }
        }

        [HttpPost("verify-code")]
        public IActionResult VerifyCode([FromBody] VerifyCodeRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Code))
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Email and Code are required."
                });
            }

            if (_cache.TryGetValue(request.Email, out string? cachedCode) && cachedCode != null)
            {
                if (cachedCode == request.Code)
                {
                    _cache.Remove(request.Email); // Xoá mã sau khi xác thực thành công
                    return Ok(new
                    {
                        status = "success",
                        message = "Verification code is valid. You can continue"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        status = "error",
                        message = "Invalid verification code."
                    });
                }
            }
            else
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Verification code has expired or does not exist."
                });
            }
        }

        [HttpGet("GetUserById/{userId}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var user = await userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new
                {
                    status = "error",
                    message = "User not found."
                });
            }
            var userDto = _mapper.Map<UserInfoDTO>(user);
            return Ok(userDto);

        }

        [HttpPut("Update-info/{userId}")]
        public async Task<IActionResult> UpdateUserInfo(int userId, [FromBody] UpdateUserInfoRequestDTO request)
        {
            if (request == null)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "Request body is invalid."
                });
            }

            // check validation
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

                return BadRequest(new
                {
                    status = "error",
                    message = "Validation failed.",
                    errors = errors
                });
            }

            try
            {
                //check user exists
                var existingUser = await userRepository.GetUserByIdAsync(userId);
                if (existingUser == null)
                {
                    return NotFound(new
                    {
                        status = "error",
                        message = "User not found."
                    });
                }

                var success = await userRepository.UpdateUserInfoAsync(userId, request);
                if (!success)
                {
                    return BadRequest(new
                    {
                        status = "error",
                        message = "Failed to update user info."
                    });
                }

                return Ok(new
                {
                    status = "success",
                    message = "User info updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = "error",
                    message = "An error occurred while updating user info.",
                    details = ex.Message
                });
            }
        }
    }
}