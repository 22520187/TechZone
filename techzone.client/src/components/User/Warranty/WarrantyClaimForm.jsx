import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import api from "../../../features/AxiosInstance/AxiosInstance";
import { message } from "antd";

const WarrantyClaimForm = ({ warrantyId, userId, onClose, onSuccess }) => {
  const [issueDescription, setIssueDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        message.warning(`${file.name} quá lớn. Kích thước tối đa là 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        message.warning(`${file.name} không phải là hình ảnh.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Upload to warranty image service
        const response = await api.post('/api/Image/upload/warranty', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data.url || response.data.imageUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...urls]);
      setImages([...images, ...validFiles]);
      message.success(`Đã tải lên ${urls.length} hình ảnh`);
    } catch (error) {
      console.error("Error uploading images:", error);
      message.error("Không thể tải lên hình ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!issueDescription.trim()) {
      message.error("Vui lòng mô tả vấn đề của sản phẩm");
      return;
    }

    if (issueDescription.trim().length < 10) {
      message.error("Mô tả vấn đề phải có ít nhất 10 ký tự");
      return;
    }

    setLoading(true);
    try {
      const claimData = {
        warrantyId: warrantyId,
        userId: userId,
        issueDescription: issueDescription.trim(),
        issueImageUrls: imageUrls.length > 0 ? imageUrls : null,
      };

      await api.post('/api/WarrantyClaim/create', claimData);
      message.success("Yêu cầu bảo hành đã được gửi thành công!");
      onSuccess();
    } catch (error) {
      console.error("Error creating warranty claim:", error);
      message.error(
        error.response?.data?.message || 
        "Không thể tạo yêu cầu bảo hành. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tạo yêu cầu bảo hành</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả vấn đề <span className="text-red-500">*</span>
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải với sản phẩm (tối thiểu 10 ký tự)..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                {issueDescription.length}/2000 ký tự
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh minh chứng (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    {uploading ? "Đang tải lên..." : "Nhấp để tải lên hình ảnh"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF tối đa 5MB mỗi ảnh
                  </p>
                </label>
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vui lòng mô tả chi tiết vấn đề để chúng tôi có thể hỗ trợ bạn tốt nhất</li>
                    <li>Hình ảnh minh chứng sẽ giúp quá trình xử lý nhanh hơn</li>
                    <li>Yêu cầu của bạn sẽ được xem xét trong vòng 1-3 ngày làm việc</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || uploading}
              >
                {loading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WarrantyClaimForm;

