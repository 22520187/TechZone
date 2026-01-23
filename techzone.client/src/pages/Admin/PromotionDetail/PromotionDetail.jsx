import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { message, Spin } from "antd";
import { ArrowLeft, Calendar, Tag, Percent } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPromotionDetail } from "../../../features/Admin/Promotions/Promotion";
import dayjs from "dayjs";

const PromotionDetail = () => {
  const { promotionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { promotionDetail, status } = useSelector((state) => state.promotion);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchPromotionDetail(promotionId)).unwrap();
      } catch (error) {
        message.error("Failed to fetch promotion details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (promotionId) {
      fetchData();
    }
  }, [promotionId, dispatch]);

  const handleBack = () => {
    navigate("/admin/promotions");
  };

  if (loading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading promotion details..." />
      </div>
    );
  }

  if (!promotionDetail || promotionDetail.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Promotion Not Found
        </h2>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Promotions
        </button>
      </div>
    );
  }

  const promotion = Array.isArray(promotionDetail) ? promotionDetail[0] : promotionDetail;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Promotions
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{promotion.name}</h1>
        </div>

        {/* Promotion Details Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Promotion Code
                </label>
                <div className="flex items-center">
                  <Tag size={18} className="mr-2 text-blue-600" />
                  <span className="text-xl font-semibold text-gray-900">
                    {promotion.promotionCode}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Discount Percentage
                </label>
                <div className="flex items-center">
                  <Percent size={18} className="mr-2 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {promotion.discountPercentage}%
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Status
                </label>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    promotion.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {promotion.status || "Inactive"}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Start Date
                </label>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-gray-600" />
                  <span className="text-lg text-gray-900">
                    {dayjs(promotion.startDate).format("DD MMM YYYY, HH:mm")}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  End Date
                </label>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-gray-600" />
                  <span className="text-lg text-gray-900">
                    {dayjs(promotion.endDate).format("DD MMM YYYY, HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {promotion.description && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Description
              </label>
              <p className="text-gray-700 whitespace-pre-wrap">
                {promotion.description}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PromotionDetail;
