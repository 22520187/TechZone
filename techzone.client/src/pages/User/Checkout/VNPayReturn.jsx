import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button, Card, Descriptions, Typography, Spin } from "antd";
import api from "../../../features/AxiosInstance/AxiosInstance";

const { Title, Text } = Typography;

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState({});

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all query parameters
        const queryString = window.location.search;
        
        // Call backend to verify payment
        const response = await api.get(`/api/VNPay/payment-callback${queryString}`);
        
        if (response.data) {
          setPaymentStatus(response.data.success ? "success" : "failed");
          setPaymentInfo({
            orderId: response.data.orderId,
            transactionNo: response.data.transactionNo,
            responseCode: response.data.responseCode,
            message: response.data.message,
          });
        }
      } catch (error) {
        console.error("Failed to verify payment:", error);
        setPaymentStatus("error");
        setPaymentInfo({
          message: "Có lỗi xảy ra khi xác thực thanh toán. Vui lòng liên hệ hỗ trợ.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center p-8">
          <Spin size="large" />
          <Title level={4} className="mt-4">
            Đang xác thực thanh toán...
          </Title>
          <Text type="secondary">Vui lòng đợi trong giây lát</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 md:px-6 max-w-2xl"
      >
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            {paymentStatus === "success" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
                <Title level={2} className="text-green-600">
                  Thanh toán thành công!
                </Title>
                <Text type="secondary" className="text-lg">
                  Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
                </Text>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <XCircle className="mx-auto h-20 w-20 text-red-500 mb-4" />
                <Title level={2} className="text-red-600">
                  Thanh toán thất bại
                </Title>
                <Text type="secondary" className="text-lg">
                  {paymentInfo.message || "Đã có lỗi xảy ra trong quá trình thanh toán."}
                </Text>
              </motion.div>
            )}
          </div>

          <div className="my-8">
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: "bold" }}
            >
              {paymentInfo.orderId && (
                <Descriptions.Item label="Mã đơn hàng">
                  #{paymentInfo.orderId}
                </Descriptions.Item>
              )}
              {paymentInfo.transactionNo && (
                <Descriptions.Item label="Mã giao dịch VNPay">
                  {paymentInfo.transactionNo}
                </Descriptions.Item>
              )}
              {paymentInfo.responseCode && (
                <Descriptions.Item label="Mã phản hồi">
                  {paymentInfo.responseCode}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          <div className="flex gap-4 justify-center">
            {paymentStatus === "success" ? (
              <>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate(`/order/${paymentInfo.orderId}`)}
                >
                  Xem đơn hàng
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/checkout")}
                >
                  Thử lại
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default VNPayReturn;

