import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Calendar, Package, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../../features/AxiosInstance/AxiosInstance";
import { message } from "antd";

const WarrantyList = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchWarranties = async () => {
      if (!userId) {
        setError("Please login to view warranties");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/Warranty/user/${userId}`);
        
        if (response.data && Array.isArray(response.data)) {
          setWarranties(response.data);
        } else {
          setWarranties([]);
        }
      } catch (err) {
        console.error("Error fetching warranties:", err);
        setError(err.response?.data?.message || "Không thể tải danh sách bảo hành");
        message.error(err.response?.data?.message || "Không thể tải danh sách bảo hành");
        setWarranties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarranties();
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "EXPIRED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
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
        <h1 className="text-xl font-bold mb-4 text-primary-600">
          Warranty List
        </h1>
        <p className="text-gray-600">Manage and track your warranties</p>
      </motion.div>

      {warranties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-12 text-center"
        >
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No warranties found
          </h3>
          <p className="text-gray-500">
            You don't have any products with warranties. Warranties will be automatically created when the order is delivered.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {warranties.map((warranty) => (
            <motion.div
              key={warranty.warrantyId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/warranty/${warranty.warrantyId}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={warranty.product?.imageUrl || warranty.product?.productImages?.[0]?.imageUrl || "/placeholder.png"}
                      alt={warranty.product?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {warranty.product?.name || "Sản phẩm"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Loại bảo hành: {warranty.warrantyType || "Standard"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Bắt đầu</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(warranty.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Kết thúc</p>
                        <p className={`text-sm font-medium ${
                          isExpired(warranty.endDate) ? "text-red-600" : 
                          isExpiringSoon(warranty.endDate) ? "text-orange-600" : 
                          "text-gray-900"
                        }`}>
                          {formatDate(warranty.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Thời hạn</p>
                        <p className="text-sm font-medium text-gray-900">
                          {warranty.warrantyPeriodMonths} tháng
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(warranty.status)}
                      <div>
                        <p className="text-xs text-gray-500">Trạng thái</p>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(warranty.status)}`}>
                          {warranty.status === "Active" ? "Đang bảo hành" : 
                           warranty.status === "Expired" ? "Hết hạn" : 
                           warranty.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpiringSoon(warranty.endDate) && !isExpired(warranty.endDate) && (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-700">
                        ⚠️ Bảo hành sẽ hết hạn trong vòng 30 ngày tới
                      </p>
                    </div>
                  )}

                  {warranty.warrantyClaims && warranty.warrantyClaims.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Đã có {warranty.warrantyClaims.length} yêu cầu bảo hành
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/warranty/${warranty.warrantyId}`);
                  }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  View details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarrantyList;

