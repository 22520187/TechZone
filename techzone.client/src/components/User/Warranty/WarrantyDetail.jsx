import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Calendar, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Plus,
  FileText,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../features/AxiosInstance/AxiosInstance";
import { message } from "antd";
import WarrantyClaimForm from "./WarrantyClaimForm";

const WarrantyDetail = () => {
  const [warranty, setWarranty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const navigate = useNavigate();
  const { warrantyId } = useParams();
  const userId = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchWarranty = async () => {
      if (!warrantyId) {
        setError("Warranty ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/Warranty/${warrantyId}`);
        
        if (response.data) {
          setWarranty(response.data);
        } else {
          setError("Warranty not found");
        }
      } catch (err) {
        console.error("Error fetching warranty:", err);
        setError(err.response?.data?.message || "Không thể tải thông tin bảo hành");
        message.error(err.response?.data?.message || "Không thể tải thông tin bảo hành");
      } finally {
        setLoading(false);
      }
    };

    fetchWarranty();
  }, [warrantyId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "EXPIRED":
        return "text-red-600 bg-red-50";
      case "VOIDED":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getClaimStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-50";
      case "COMPLETED":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getClaimStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Đang chờ";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const canCreateClaim = () => {
    if (!warranty) return false;
    if (warranty.status !== "Active") return false;
    if (isExpired(warranty.endDate)) return false;
    return true;
  };

  const handleClaimCreated = () => {
    setShowClaimForm(false);
    // Refresh warranty data
    const fetchWarranty = async () => {
      try {
        const response = await api.get(`/api/Warranty/${warrantyId}`);
        if (response.data) {
          setWarranty(response.data);
        }
      } catch (err) {
        console.error("Error refreshing warranty:", err);
      }
    };
    fetchWarranty();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !warranty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || "Không tìm thấy bảo hành"}</p>
          <button
            onClick={() => navigate("/warranty")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Back to warranty list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate("/warranty")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to warranty list
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={warranty.product?.productImages?.[0]?.imageUrl || "/placeholder.png"}
                alt={warranty.product?.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {warranty.product?.name || "Sản phẩm"}
                </h1>
                <p className="text-gray-600">
                  Loại bảo hành: <span className="font-semibold">{warranty.warrantyType || "Standard"}</span>
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(warranty.status)}`}>
              {warranty.status === "Active" ? "Đang bảo hành" : 
               warranty.status === "Expired" ? "Hết hạn" : 
               warranty.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Ngày bắt đầu</h3>
              </div>
              <p className="text-gray-700">{formatDate(warranty.startDate)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Ngày kết thúc</h3>
              </div>
              <p className={`font-semibold ${
                isExpired(warranty.endDate) ? "text-red-600" : 
                isExpiringSoon(warranty.endDate) ? "text-orange-600" : 
                "text-gray-700"
              }`}>
                {formatDate(warranty.endDate)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Thời hạn bảo hành</h3>
              </div>
              <p className="text-gray-700">{warranty.warrantyPeriodMonths} tháng</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Mã bảo hành</h3>
              </div>
              <p className="text-gray-700 font-mono">#{warranty.warrantyId}</p>
            </div>
          </div>

          {warranty.warrantyDescription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Điều khoản bảo hành</h3>
              <p className="text-gray-700 text-sm">{warranty.warrantyDescription}</p>
            </div>
          )}

          {isExpiringSoon(warranty.endDate) && !isExpired(warranty.endDate) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Bảo hành sẽ hết hạn trong vòng 30 ngày tới
              </p>
            </div>
          )}

          {isExpired(warranty.endDate) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Bảo hành đã hết hạn
              </p>
            </div>
          )}

          {canCreateClaim() && (
            <button
              onClick={() => setShowClaimForm(true)}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create warranty claim
            </button>
          )}
        </div>

        {/* Warranty Claims Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Lịch sử yêu cầu bảo hành ({warranty.warrantyClaims?.length || 0})
          </h2>

          {!warranty.warrantyClaims || warranty.warrantyClaims.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có yêu cầu bảo hành nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {warranty.warrantyClaims.map((claim) => (
                <motion.div
                  key={claim.warrantyClaimId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                          {getClaimStatusText(claim.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Mã yêu cầu: #{claim.warrantyClaimId}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{claim.issueDescription}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                      {claim.issueImages && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Hình ảnh:</p>
                          <div className="flex gap-2 flex-wrap">
                            {JSON.parse(claim.issueImages).map((imgUrl, index) => (
                              <img
                                key={index}
                                src={imgUrl}
                                alt={`Issue ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {claim.adminNotes && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Ghi chú từ admin:</p>
                          <p className="text-sm text-gray-600">{claim.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {showClaimForm && (
        <WarrantyClaimForm
          warrantyId={warranty.warrantyId}
          userId={userId}
          onClose={() => setShowClaimForm(false)}
          onSuccess={handleClaimCreated}
        />
      )}
    </div>
  );
};

export default WarrantyDetail;

