import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card } from "antd";
import { ShoppingBag, Home, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: "",
    total: "0.00",
  });

  useEffect(() => {
    // Get order details from URL query params
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("orderNumber") || "";
    const total = searchParams.get("total") || "0.00";

    setOrderDetails({ orderNumber, total });

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl">
      <Card>
        <div className="bg-primary/10 p-8 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-primary/20 rounded-full p-3 mb-4"
          >
            <CheckCircle className="h-12 w-12 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            Đặt hàng thành công!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-muted-foreground max-w-md"
          >
            Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
          </motion.p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Thông tin đơn hàng</h2>

              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Mã đơn hàng</span>
                  <span className="font-medium">
                    #{orderDetails.orderNumber}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b">
                  <span className="text-muted-foreground">Ngày đặt hàng</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Tổng tiền</span>
                  <span>${orderDetails.total}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Bước tiếp theo</h2>
              <p className="text-muted-foreground">
                Bạn sẽ nhận được email xác nhận đơn hàng trong thời gian sớm nhất. 
                Chúng tôi sẽ thông báo lại khi đơn hàng được giao.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/products")}
                className="flex-1 bg-gradient-to-br from-primary to-secondary hover:from-primary-500 hover:to-secondary-500"
                icon={<ShoppingBag className="mr-2 h-5 w-5" />}
              >
                Tiếp tục mua hàng
              </Button>

              <Button
                size="large"
                onClick={() => navigate("/")}
                className="flex-1"
                icon={<Home className="mr-2 h-5 w-5" />}
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
