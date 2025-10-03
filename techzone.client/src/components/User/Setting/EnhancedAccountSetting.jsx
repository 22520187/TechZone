import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Edit2, X, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import EditModal from "./EditModal";
import { useNavigate } from "react-router-dom";

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: custom * 0.1,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
        },
    }),
};

const EnhancedAccountSetting = () => {
    const navigate = useNavigate();
    
    // Missing state variables
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    
    // Profile Data with mock data
    const [profileData, setProfileData] = useState({
        fullName: "Nguyễn Văn An",
        email: "nguyenvanan@gmail.com",
        phoneNumber: "0901234567",
        city: "79", // Hồ Chí Minh
        district: "760", // Quận 1
        ward: "26734", // Phường Bến Nghé
        avatarUrl: "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png", // Default avatar
    });
    const [tempProfileData, setTempProfileData] = useState({ ...profileData });

    // File upload state
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [imageChanged, setImageChanged] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Location States with mock data
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Mock location data
    const mockCities = [
        { ProvinceID: "01", ProvinceName: "Hà Nội" },
        { ProvinceID: "79", ProvinceName: "Thành phố Hồ Chí Minh" },
        { ProvinceID: "48", ProvinceName: "Đà Nẵng" },
        { ProvinceID: "92", ProvinceName: "Cần Thơ" },
        { ProvinceID: "31", ProvinceName: "Hải Phòng" },
        { ProvinceID: "77", ProvinceName: "Bà Rịa - Vũng Tàu" },
        { ProvinceID: "74", ProvinceName: "Bình Dương" },
        { ProvinceID: "75", ProvinceName: "Đồng Nai" },
    ];

    const mockDistricts = {
        "01": [
            { DistrictID: "001", DistrictName: "Quận Ba Đình" },
            { DistrictID: "002", DistrictName: "Quận Hoàn Kiếm" },
            { DistrictID: "003", DistrictName: "Quận Tây Hồ" },
            { DistrictID: "004", DistrictName: "Quận Long Biên" },
            { DistrictID: "005", DistrictName: "Quận Cầu Giấy" },
        ],
        "79": [
            { DistrictID: "760", DistrictName: "Quận 1" },
            { DistrictID: "761", DistrictName: "Quận 2" },
            { DistrictID: "762", DistrictName: "Quận 3" },
            { DistrictID: "763", DistrictName: "Quận 4" },
            { DistrictID: "764", DistrictName: "Quận 5" },
            { DistrictID: "765", DistrictName: "Quận 6" },
            { DistrictID: "766", DistrictName: "Quận 7" },
            { DistrictID: "767", DistrictName: "Quận 8" },
            { DistrictID: "768", DistrictName: "Quận 9" },
            { DistrictID: "769", DistrictName: "Quận 10" },
        ],
    };

    const mockWards = {
        "760": [
            { WardCode: "26734", WardName: "Phường Bến Nghé" },
            { WardCode: "26737", WardName: "Phường Bến Thành" },
            { WardCode: "26740", WardName: "Phường Cầu Kho" },
            { WardCode: "26743", WardName: "Phường Cầu Ông Lãnh" },
            { WardCode: "26746", WardName: "Phường Cô Giang" },
        ],
        "761": [
            { WardCode: "26749", WardName: "Phường An Phú" },
            { WardCode: "26752", WardName: "Phường Thảo Điền" },
            { WardCode: "26755", WardName: "Phường An Khánh" },
            { WardCode: "26758", WardName: "Phường Bình An" },
        ],
    };


    // useEffect to load mock data
    useEffect(() => {
        // Simulate loading
        setLoading(true);
        
        setTimeout(() => {
            setCities(mockCities);
            setDistricts(mockDistricts[profileData.city] || []);
            setWards(mockWards[profileData.district] || []);
            setLoading(false);
        }, 1000);
    }, []);

    // Update districts when city changes
    useEffect(() => {
        if (profileData.city) {
            setDistricts(mockDistricts[profileData.city] || []);
        } else {
            setDistricts([]);
        }
    }, [profileData.city]);

    // Update wards when district changes  
    useEffect(() => {
        if (profileData.district) {
            setWards(mockWards[profileData.district] || []);
        } else {
            setWards([]);
        }
    }, [profileData.district]);

    // Helper function to get location name by ID
    const getLocationName = (id, type) => {
        if (!id) return "Chưa chọn";
        
        switch (type) {
            case "city":
                const city = cities.find(c => c.ProvinceID === id);
                return city ? city.ProvinceName : "Chưa chọn";
            case "district":
                const district = districts.find(d => d.DistrictID === id);
                return district ? district.DistrictName : "Chưa chọn";
            case "ward":
                const ward = wards.find(w => w.WardCode === id);
                return ward ? ward.WardName : "Chưa chọn";
            default:
                return "Chưa chọn";
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field],
        });
    };

    // Handle password form changes
    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({
            ...passwordForm,
            [name]: value,
        });
    };

    // Handle password change submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        // Mock password change
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success("Đổi mật khẩu thành công!");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại!");
        }
    };

    // Handle file selection for avatar
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Vui lòng chọn file hình ảnh");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File không được vượt quá 5MB");
            return;
        }

        setIsUploading(true);
        
        try {
            // Create preview URL
            const imageUrl = URL.createObjectURL(file);
            
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update temp profile data
            setTempProfileData({
                ...tempProfileData,
                avatarUrl: imageUrl,
            });
            
            setImageChanged(true);
            toast.success("Tải ảnh lên thành công!");
        } catch (error) {
            toast.error("Tải ảnh lên thất bại. Vui lòng thử lại!");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle profile save
    const saveProfileChanges = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setProfileData({ ...tempProfileData });
            setIsProfileModalOpen(false);
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại!");
        }
    };

    // Handle logout
    const handleLogout = () => {
        // dispatch(logout());
        toast.success("Đăng xuất thành công!");
        navigate("/auth/login");
    };

    // Open profile modal
    const openProfileModal = () => {
        setTempProfileData({ ...profileData });
        setIsProfileModalOpen(true);
    };

    // Animation variants
    const inputVariants = {
        focus: { scale: 1.01, boxShadow: "0 0 0 2px rgba(249, 115, 22, 0.2)" },
        blur: { scale: 1, boxShadow: "none" },
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { scale: 1.03, transition: { duration: 0.2 } },
        tap: { scale: 0.98, transition: { duration: 0.2 } },
    };

    // Update districts when temp city changes (for modal)
    useEffect(() => {
        if (tempProfileData.city) {
            setDistricts(mockDistricts[tempProfileData.city] || []);
        }
    }, [tempProfileData.city]);

    // Update wards when temp district changes (for modal)  
    useEffect(() => {
        if (tempProfileData.district) {
            setWards(mockWards[tempProfileData.district] || []);
        }
    }, [tempProfileData.district]);

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    <p className="font-medium">Error loading profile</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-2"
        >
            <h1 className="text-xl font-bold mb-12 text-primary-600">USER PROFILE</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <motion.div className="space-y-8" variants={fadeIn} custom={1}>
                    <div className="flex flex-col bg-white rounded-xl shadow-xl p-8 md:p-12 items-start gap-6 relative">
                        {/* profile Image */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="w-24 h-24 rounded-full overflow-hidden bg-sky-500 flex-shrink-0 relative group cursor-pointer"
                                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {/* Avatar Image */}
                                <img
                                    src={"/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png"}
                                    alt="Profile Image"
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay with camera icon on hover */}
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFileSelect}
                                />
                            </motion.div>
                            <p className="text-xs text-gray-500 mt-2">
                                Click to change avatar
                            </p>
                        </div>

                        {/* Account Info */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 w-full">
              {[
                { label: "Full Name", value: profileData.fullName },
                { label: "Email", value: profileData.email },
                { label: "Phone Number", value: profileData.phoneNumber },
                {
                  label: "City",
                  value: getLocationName(profileData.city, "city"),
                },
                {
                  label: "District",
                  value: getLocationName(profileData.district, "district"),
                },
                {
                  label: "Ward",
                  value: getLocationName(profileData.ward, "ward"),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={fadeIn}
                  custom={index * 0.2 + 2}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-6 justify-center w-full">
              <motion.button
                onClick={openProfileModal}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-gradient-to-br from-primary to-secondary rounded-md hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} /> EDIT PROFILE
              </motion.button>

              <motion.button
                onClick={handleLogout}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-gradient-to-br from-primary to-secondary rounded-md hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 transition-colors flex items-center gap-2"
              >
                <X size={16} /> LOG OUT
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Password Change Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-150 mx-auto -mt-0">
          <motion.div
            variants={fadeIn}
            custom={5}
            className="mt-16 max-w-xl mx-auto"
          >
            <h2 className="text-lg font-medium mb-6 text-primary-600">
              CHANGE PASSWORD
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <motion.div variants={fadeIn} custom={5.1} className="relative">
                <label className="text-sm text-gray-500 block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <motion.input
                    variants={inputVariants}
                    whileFocus="focus"
                    animate="blur"
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 transition-all duration-200"
                    placeholder="••••••••••"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} custom={5.2} className="relative">
                <label className="text-sm text-gray-500 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <motion.input
                    variants={inputVariants}
                    whileFocus="focus"
                    animate="blur"
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 transition-all duration-200"
                    placeholder="8+ characters"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} custom={5.3} className="relative">
                <label className="text-sm text-gray-500 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <motion.input
                    variants={inputVariants}
                    whileFocus="focus"
                    animate="blur"
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-primary-500 transition-all duration-200"
                    placeholder="8+ characters"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-gradient-to-br from-primary to-secondary rounded-md hover:bg-gradient-to-br hover:from-primary-600 hover:to-secondary-600 transition-colors"
              >
                CHANGE PASSWORD
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={saveProfileChanges}
        title="Edit Profile"
      >
        <div className="space-y-4">
          {/* Avatar Upload in Modal */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-24 h-24 rounded-full overflow-hidden bg-sky-500 flex-shrink-0 relative group cursor-pointer mb-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Avatar Preview */}
              <img
                src={
                  tempProfileData.avatarUrl ||
                  "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png";
                }}
              />

              {/* Overlay with camera icon */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Click to change avatar</p>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={tempProfileData.fullName}
              onChange={(e) =>
                setTempProfileData({
                  ...tempProfileData,
                  fullName: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={tempProfileData.email}
              onChange={(e) =>
                setTempProfileData({
                  ...tempProfileData,
                  email: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
              disabled // Email shouldn't be editable
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={tempProfileData.phoneNumber}
              onChange={(e) =>
                setTempProfileData({
                  ...tempProfileData,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">City</label>
            <select
              value={tempProfileData.city}
              onChange={(e) =>
                setTempProfileData({
                  ...tempProfileData,
                  city: e.target.value,
                  district: "",
                  ward: "",
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.ProvinceID} value={city.ProvinceID}>
                  {city.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">District</label>
            <select
              value={tempProfileData.district}
              onChange={(e) =>
                setTempProfileData({
                  ...tempProfileData,
                  district: e.target.value,
                  ward: "",
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
              disabled={!tempProfileData.city}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.DistrictID} value={district.DistrictID}>
                  {district.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Ward</label>
            <select
              value={tempProfileData.ward}
              onChange={(e) =>
                setTempProfileData({ ...tempProfileData, ward: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-500"
              disabled={!tempProfileData.district}
            >
              <option value="">Select Ward</option>
              {wards.map((ward) => (
                <option key={ward.WardCode} value={ward.WardCode}>
                  {ward.WardName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </EditModal>
    </motion.div>
  );
};

export default EnhancedAccountSetting;
