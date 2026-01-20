using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TechZone.Server.Models.Domain;
using TechZone.Server.Models.DTO.GET;
using TechZone.Server.Models.DTO.ADD;
using TechZone.Server.Models.DTO.UPDATE;
using TechZone.Server.Repositories;

namespace TechZone.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffRepository _staffRepository;
        private readonly IMapper _mapper;
        private readonly ICartRepository _cartRepository;

        public StaffController(IStaffRepository staffRepository, IMapper mapper, ICartRepository cartRepository)
        {
            _staffRepository = staffRepository;
            _mapper = mapper;
            _cartRepository = cartRepository;
        }

        // GET: api/Staff/GetAllStaffs
        [HttpGet("GetAllStaffs")]
        public async Task<IActionResult> GetAllStaffs()
        {
            try
            {
                var staffs = await _staffRepository.GetAllStaffAsync();
                var staffDtos = _mapper.Map<List<AdminStaffDTO>>(staffs);
                return Ok(staffDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { status = "error", message = "Error retrieving staff members", details = ex.Message });
            }
        }

        // GET: api/Staff/GetStaffById/5
        [HttpGet("GetStaffById/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            try
            {
                var staff = await _staffRepository.GetStaffByIdAsync(id);
                if (staff == null)
                {
                    return NotFound(new { status = "error", message = "Staff member not found" });
                }

                var staffDto = _mapper.Map<AdminStaffDTO>(staff);
                return Ok(staffDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { status = "error", message = "Error retrieving staff member", details = ex.Message });
            }
        }

        // POST: api/Staff/AddStaff
        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddStaff([FromBody] AdminAddStaffDTO adminAddStaffDTO)
        {
            try
            {
                // Check if email already exists
                bool isEmailExists = await _staffRepository.IsEmailExistsAsync(adminAddStaffDTO.Email);
                if (isEmailExists)
                {
                    return BadRequest(new { status = "error", message = "Email already exists" });
                }

                var staff = _mapper.Map<User>(adminAddStaffDTO);
                staff.Role = "Staff";
                
                var result = await _staffRepository.AddStaffAsync(staff);


                var staffDto = _mapper.Map<AdminStaffDTO>(result);
                return Ok(staffDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { status = "error", message = "Error adding staff member", details = ex.Message });
            }
        }

        // PUT: api/Staff/UpdateStaff/5
        [HttpPut("UpdateStaff/{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] AdminUpdateStaffDTO adminUpdateStaffDTO)
        {
            try
            {
                var existingStaff = await _staffRepository.GetStaffByIdAsync(id);
                if (existingStaff == null)
                {
                    return NotFound(new { status = "error", message = "Staff member not found" });
                }

                var success = await _staffRepository.UpdateStaffAsync(id, adminUpdateStaffDTO);
                if (!success)
                {
                    return BadRequest(new { status = "error", message = "Failed to update staff member" });
                }

                var updatedStaff = await _staffRepository.GetStaffByIdAsync(id);
                var staffDto = _mapper.Map<AdminStaffDTO>(updatedStaff);
                return Ok(staffDto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { status = "error", message = "Error updating staff member", details = ex.Message });
            }
        }

        // DELETE: api/Staff/DeleteStaff/5
        [HttpDelete("DeleteStaff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var staff = await _staffRepository.DeleteStaffAsync(id);
                if (staff == null)
                {
                    return NotFound(new { status = "error", message = "Staff member not found" });
                }

                var staffDto = _mapper.Map<AdminStaffDTO>(staff);
                return Ok(staffDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { status = "error", message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { status = "error", message = "An error occurred while deleting staff member", details = ex.Message });
            }
        }
    }
}
