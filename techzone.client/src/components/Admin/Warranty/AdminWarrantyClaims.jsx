import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Filter,
  X
} from "lucide-react";
import { Modal, Select, Input, message } from "antd";
import api from "../../../features/AxiosInstance/AxiosInstance";

const { TextArea } = Input;

const AdminWarrantyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [newStatus, setNewStatus] = useState("Pending");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/WarrantyClaim/all');
      if (response.data && Array.isArray(response.data)) {
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
      setError(err.response?.data?.message || "Không thể tải danh sách yêu cầu bảo hành");
      message.error(err.response?.data?.message || "Không thể tải danh sách yêu cầu bảo hành");
      setClaims([]);
    } finally {
      setLoading(false);
    }
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
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-300";
      case "INPROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "COMPLETED":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
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
      case "INPROGRESS":
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
        return "Đang chờ";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
      case "INPROGRESS":
        return "Đang xử lý";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const filteredClaims = useMemo(() => {
    if (!statusFilter) return claims;
    return claims.filter(claim => claim.status?.toUpperCase() === statusFilter.toUpperCase());
  }, [claims, statusFilter]);

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (claim) => {
    setSelectedClaim(claim);
    setNewStatus(claim.status);
    setAdminNotes(claim.adminNotes || "");
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedClaim) return;

    try {
      await api.put(`/api/WarrantyClaim/status/${selectedClaim.warrantyClaimId}`, {
        status: newStatus,
        adminNotes: adminNotes || null
      });
      message.success("Cập nhật trạng thái thành công!");
      setShowStatusModal(false);
      setSelectedClaim(null);
      setAdminNotes("");
      fetchClaims();
    } catch (err) {
      console.error("Error updating status:", err);
      message.error(err.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const resetFilters = () => {
    setStatusFilter(undefined);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          Quản lý yêu cầu bảo hành
        </h1>
        <p className="text-gray-600">Xem và xử lý tất cả các yêu cầu bảo hành từ khách hàng</p>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
          </div>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            allowClear
          >
            <Select.Option value="Pending">Đang chờ</Select.Option>
            <Select.Option value="Approved">Đã duyệt</Select.Option>
            <Select.Option value="Rejected">Đã từ chối</Select.Option>
            <Select.Option value="InProgress">Đang xử lý</Select.Option>
            <Select.Option value="Completed">Hoàn thành</Select.Option>
          </Select>
          {statusFilter && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {filteredClaims.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {statusFilter ? "Không có yêu cầu nào với trạng thái này" : "Chưa có yêu cầu bảo hành nào"}
          </h3>
          <p className="text-gray-500">
            {statusFilter ? "Thử chọn trạng thái khác hoặc xóa bộ lọc" : "Các yêu cầu bảo hành sẽ xuất hiện ở đây"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <motion.div
              key={claim.warrantyClaimId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(claim.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Yêu cầu #{claim.warrantyClaimId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Khách hàng: {claim.user?.fullName || "N/A"} ({claim.user?.email || "N/A"})
                    </p>
                    <p className="text-sm text-gray-500">
                      Sản phẩm: {claim.warranty?.product?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(claim.status)}`}>
                    {getStatusText(claim.status)}
                  </span>
                  <button
                    onClick={() => handleViewDetail(claim)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(claim)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Cập nhật trạng thái"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Mô tả vấn đề:</span> {claim.issueDescription}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <span>Gửi: {formatDateTime(claim.submittedAt)}</span>
                {claim.resolvedAt && (
                  <span>Xử lý: {formatDateTime(claim.resolvedAt)}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết yêu cầu #${selectedClaim?.warrantyClaimId}`}
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedClaim(null);
        }}
        footer={null}
        width={800}
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Thông tin khách hàng</h4>
              <p className="text-gray-600">Tên: {selectedClaim.user?.fullName || "N/A"}</p>
              <p className="text-gray-600">Email: {selectedClaim.user?.email || "N/A"}</p>
              <p className="text-gray-600">Số điện thoại: {selectedClaim.user?.phone || "N/A"}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Thông tin sản phẩm</h4>
              <p className="text-gray-600">Tên sản phẩm: {selectedClaim.warranty?.product?.name || "N/A"}</p>
              <p className="text-gray-600">Mã bảo hành: #{selectedClaim.warranty?.warrantyId || "N/A"}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Mô tả vấn đề</h4>
              <p className="text-gray-600">{selectedClaim.issueDescription}</p>
            </div>

            {selectedClaim.issueImages && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Hình ảnh minh chứng</h4>
                <div className="flex gap-2 flex-wrap">
                  {JSON.parse(selectedClaim.issueImages).map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`Issue ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(imgUrl, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Trạng thái</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedClaim.status)}`}>
                {getStatusText(selectedClaim.status)}
              </span>
            </div>

            {selectedClaim.adminNotes && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Ghi chú từ admin</h4>
                <p className="text-gray-600">{selectedClaim.adminNotes}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Thời gian</h4>
              <p className="text-gray-600">Gửi: {formatDateTime(selectedClaim.submittedAt)}</p>
              {selectedClaim.resolvedAt && (
                <p className="text-gray-600">Xử lý: {formatDateTime(selectedClaim.resolvedAt)}</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={`Cập nhật trạng thái yêu cầu #${selectedClaim?.warrantyClaimId}`}
        open={showStatusModal}
        onOk={handleStatusUpdate}
        onCancel={() => {
          setShowStatusModal(false);
          setSelectedClaim(null);
          setAdminNotes("");
        }}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {selectedClaim && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái mới
              </label>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                style={{ width: '100%' }}
              >
                <Select.Option value="Pending">Đang chờ</Select.Option>
                <Select.Option value="Approved">Đã duyệt</Select.Option>
                <Select.Option value="Rejected">Đã từ chối</Select.Option>
                <Select.Option value="InProgress">Đang xử lý</Select.Option>
                <Select.Option value="Completed">Hoàn thành</Select.Option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <TextArea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Nhập ghi chú cho khách hàng..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminWarrantyClaims;

