import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Edit2, X, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import EditModal from "./EditModal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../features/AxiosInstance/Auth/Auth";
import api from "../../../features/AxiosInstance/AxiosInstance";

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

  // API key for Location API
  const apiKey = "a84f0896-7c1a-11ef-8e53-0a00184fe694";

  // Redux hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user);

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
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [imageChanged, setImageChanged] = useState(false);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ref để tránh infinite loop trong onError của avatar
  const avatarErrorRef = useRef(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Profile Data States
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    city: "",
    district: "",
    ward: "",
    avatarUrl: "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png", // Default avatar
  });

  const [tempProfileData, setTempProfileData] = useState({ ...profileData });

  // Location States
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Helper function to get location name from ID
  const getLocationName = (id, type) => {
    if (!id) return "";
    
    if (type === "city") {
      const city = cities.find((c) => c.ProvinceID === parseInt(id));
      return city ? city.ProvinceName : id;
    } else if (type === "district") {
      const district = districts.find((d) => d.DistrictID === parseInt(id));
      return district ? district.DistrictName : id;
    } else if (type === "ward") {
      const ward = wards.find((w) => w.WardCode === id);
      return ward ? ward.WardName : id;
    }
    return id;
  };

  // Helper function to normalize avatar URL - tránh spam request
  const getAvatarUrl = (url) => {
    // Kiểm tra kỹ hơn - trim và check empty string
    if (!url || (typeof url === 'string' && url.trim() === '')) {
      return "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png";
    }

    // Xử lý trường hợp backend trả full URL (http/https)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Nếu URL bắt đầu bằng "/" và không phải là "/api", giữ nguyên (relative path)
    if (url.startsWith("/") && !url.startsWith("/api")) {
      return url;
    }

    // Xử lý trường hợp URL bắt đầu bằng "/api" hoặc không có "/"
    // Loại bỏ double slash và chuẩn hóa URL
    const baseURL = api.defaults.baseURL.replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    
    return `${baseURL}/${cleanUrl}`;
  };

  // Load User Data - Merge với localStorage logic để tránh conflict
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        if (!userId) {
          throw new Error("User ID not found. Please login again.");
        }

        const response = await api.get(`api/account/GetUserById/${userId}`);

        if (!response || response.status !== 200) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = response.data;

        console.log("Fetched user data:", userData);

        // Kiểm tra localStorage trước, nếu có thì dùng, không thì dùng từ API
        // Ưu tiên localStorage vì nó có thể chứa URL mới nhất từ lần upload gần đây
        const savedAvatar = localStorage.getItem(`user_avatar_${userId}`);
        const avatarUrl = savedAvatar || userData.photoUrl || "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png";

        // Map the API response to component state
        const formattedData = {
          fullName: userData.fullName || "",
          email: userData.email || "",
          phoneNumber: userData.phone || "",
          city: userData.city || "",
          district: userData.district || "",
          ward: userData.ward || "",
          avatarUrl: avatarUrl,
        };

        console.log("Formatted user data:", formattedData);

        setProfileData(formattedData);
        setTempProfileData(formattedData);

        // Reset error ref khi load thành công
        avatarErrorRef.current = false;

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setLoading(false);
        toast.error(err.message || "Failed to load user profile");
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [userId]);

  // Sync tempProfileData with profileData when modal opens
  useEffect(() => {
    if (isProfileModalOpen) {
      setTempProfileData({ ...profileData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileModalOpen]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Token: apiKey,
            },
          }
        );
        const data = await response.json();

        if (data && data.data) {
          setCities(data.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        toast.error("Failed to load cities");
      }
    };

    fetchCities();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!tempProfileData.city) return;

      try {
        const response = await fetch(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Token: apiKey,
            },
            body: JSON.stringify({
              province_id: parseInt(tempProfileData.city),
            }),
          }
        );
        const data = await response.json();

        if (data && data.data) {
          setDistricts(data.data);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
        toast.error("Failed to load districts");
      }
    };

    fetchDistricts();
  }, [tempProfileData.city]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!tempProfileData.district) return;

      try {
        const response = await fetch(
          "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Token: apiKey,
            },
            body: JSON.stringify({
              district_id: parseInt(tempProfileData.district),
            }),
          }
        );
        const data = await response.json();

        if (data && data.data) {
          setWards(data.data);
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
        toast.error("Failed to load wards");
      }
    };

    fetchWards();
  }, [tempProfileData.district]);

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

    try {
      const response = await api.post("api/Account/ChangePassword", {
        email: profileData.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Check response status and data
      if (response.status === 200 && response.data?.status === "success") {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data || "Đổi mật khẩu thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    try {
      setIsUploading(true);

      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Call the upload API
      const uploadResponse = await api.post("api/Image/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Get the image URL from the response
      const imageUrl = uploadResponse.data?.imageUrl;

      if (!imageUrl) {
        throw new Error("Upload failed - no image URL returned");
      }

      console.log("Uploaded image URL:", imageUrl);

      // Đánh dấu là ảnh đã được thay đổi
      setImageChanged(true);

      // Chỉ update 1 state để tránh render 2 lần - React sẽ batch các updates
      setProfileData((prev) => ({ ...prev, avatarUrl: imageUrl }));
      setTempProfileData((prev) => ({ ...prev, avatarUrl: imageUrl }));

      // Lưu URL ảnh vào localStorage để đảm bảo nó được giữ lại sau khi tải lại trang
      if (userId && imageUrl) {
        localStorage.setItem(`user_avatar_${userId}`, imageUrl);
        console.log("Saved avatar URL to localStorage:", imageUrl);
      }

      toast.success("Tải ảnh đại diện lên thành công");
      return imageUrl;
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      toast.error(
        "Không thể tải ảnh lên: " + (error.response?.data?.message || error.message)
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file hình ảnh (jpg, jpeg, png)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Upload the file
    await handleAvatarUpload(file);
    
    // Reset file input để có thể chọn lại cùng file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      if (!userId) {
        toast.error("User not identified. Please login again.");
        return;
      }

      // Prepare data to send to server
      const payload = {
        fullName: tempProfileData.fullName || "",
        phone: tempProfileData.phoneNumber || "",
        district: tempProfileData.district || "",
        city: tempProfileData.city || "",
        ward: tempProfileData.ward || "",
        photoUrl: tempProfileData.avatarUrl || "", // Use updated image URL
      };

      console.log("Saving profile with avatar URL:", tempProfileData.avatarUrl);

      // Save image URL to localStorage to ensure it's retained after page reload
      if (tempProfileData.avatarUrl) {
        localStorage.setItem(
          `user_avatar_${userId}`,
          tempProfileData.avatarUrl
        );
      }

      const response = await api.put(
        `api/Account/Update-info/${userId}`,
        payload
      );

      if (response && response.status === 200) {
        // Cập nhật dữ liệu hồ sơ với thông tin mới
        setProfileData({ ...tempProfileData });

        // Đóng modal
        setIsProfileModalOpen(false);

        // Hiển thị thông báo thành công
        toast.success("Hồ sơ đã được cập nhật thành công!");

        console.log(
          "Profile updated successfully with avatar:",
          tempProfileData.avatarUrl
        );
      } else {
        toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error in saveProfileChanges:", err);

      // Show detailed error messages
      if (err.response) {
        toast.error(
          `Error: ${err.response.data?.message || "An error occurred."}`
        );
      } else if (err.request) {
        toast.error("No response received from server.");
      } else {
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  // Handle logout
const handleLogout = (e) => {
  toast.success("Đăng xuất thành công!");
  dispatch(logout());
  // Navigate ngay lập tức, không delay
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
                  src={getAvatarUrl(profileData.avatarUrl)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  decoding="async"
                  loading="lazy"
                  onError={(e) => {
                    // Tránh infinite loop - chỉ set default một lần
                    const defaultAvatar = "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png";
                    if (!avatarErrorRef.current && e.target.src !== defaultAvatar) {
                      avatarErrorRef.current = true;
                      e.target.onerror = null; // Ngăn không cho trigger lại
                      e.target.src = defaultAvatar;
                    }
                  }}
                  onLoad={() => {
                    // Reset error flag khi load thành công
                    avatarErrorRef.current = false;
                  }}
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
                type="button"
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
                src={getAvatarUrl(tempProfileData.avatarUrl)}
                alt="Profile"
                className="w-full h-full object-cover"
                decoding="async"
                loading="lazy"
                onError={(e) => {
                  // Tránh infinite loop - chỉ set default một lần
                  const defaultAvatar = "/lovable-uploads/ee6f74d2-cb92-47f8-9971-f947f6e0a573.png";
                  if (!avatarErrorRef.current && e.target.src !== defaultAvatar) {
                    avatarErrorRef.current = true;
                    e.target.onerror = null; // Ngăn không cho trigger lại
                    e.target.src = defaultAvatar;
                  }
                }}
                onLoad={() => {
                  // Reset error flag khi load thành công
                  avatarErrorRef.current = false;
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

export default EnhancedAccountSetting