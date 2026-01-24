import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../features/AxiosInstance/AxiosInstance";
import { message } from "antd";

const WarrantyClaimHistory = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!userId) {
        setError("Please login to view warranty claim history");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/WarrantyClaim/user/${userId}`);
        
        if (response.data && Array.isArray(response.data)) {
          // Sort by submitted date (newest first)
          const sortedClaims = response.data.sort((a, b) => {
            const dateA = new Date(a.submittedAt || 0);
            const dateB = new Date(b.submittedAt || 0);
            return dateB - dateA;
          });
          setClaims(sortedClaims);
        } else {
          setClaims([]);
        }
      } catch (err) {
        console.error("Error fetching warranty claims:", err);
        setError(err.response?.data?.message || "Không thể tải lịch sử yêu cầu");
        message.error(err.response?.data?.message || "Không thể tải lịch sử yêu cầu");
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [userId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "APPROVED":
        return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "COMPLETED":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "IN_PROGRESS":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Lịch sử yêu cầu bảo hành
        </h1>
        <p className="text-gray-600">Theo dõi tất cả các yêu cầu bảo hành của bạn</p>
      </motion.div>

      {claims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-12 text-center"
        >
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Chưa có yêu cầu bảo hành nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bạn chưa tạo yêu cầu bảo hành nào. Hãy xem danh sách bảo hành để tạo yêu cầu.
          </p>
          <button
            onClick={() => navigate("/warranty")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem danh sách bảo hành
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <motion.div
              key={claim.warrantyClaimId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(claim.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Yêu cầu #{claim.warrantyClaimId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sản phẩm: {claim.warranty?.product?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(claim.status)}`}>
                  {getStatusText(claim.status)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Mô tả vấn đề:</span> {claim.issueDescription}
                </p>
              </div>

              {claim.issueImages && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Hình ảnh minh chứng:</p>
                  <div className="flex gap-2 flex-wrap">
                    {JSON.parse(claim.issueImages).map((imgUrl, index) => (
                      <img
                        key={index}
                        src={imgUrl}
                        alt={`Issue ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(imgUrl, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {claim.adminNotes && (
                <div className="mb-4 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Ghi chú từ admin:</p>
                  <p className="text-sm text-gray-600">{claim.adminNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Gửi: {formatDateTime(claim.submittedAt)}
                  </span>
                  {claim.resolvedAt && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Xử lý: {formatDateTime(claim.resolvedAt)}
                    </span>
                  )}
                </div>
                {claim.warranty && (
                  <button
                    onClick={() => navigate(`/warranty/${claim.warranty.warrantyId}`)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    Xem chi tiết bảo hành
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimHistory;

