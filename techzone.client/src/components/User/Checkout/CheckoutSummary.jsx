import React, { useState } from "react";
import { Card, Typography, Divider, Input, Button, message } from "antd";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, CreditCard, X } from "lucide-react";
import { TagOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../../../features/AxiosInstance/AxiosInstance";

const { Text, Title } = Typography;

export function CheckoutSummary({
  cartItems,
  cartTotal,
  discountAmount,
  finalTotal,
  appliedPromotion,
  setAppliedPromotion,
  isProcessing,
  onSubmit,
  form,
}) {
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      const values = await form.validateFields(); // Kiểm tra form trước khi submit
      onSubmit(values); // Nếu hợp lệ thì gọi hàm submit với form values
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  // Apply promo code
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      message.warning("Please enter a promotion code");
      return;
    }

    setIsApplyingPromo(true);

    try {
      const response = await api.post("/api/Promotion/ValidatePromotionCode", {
        promotionCode: promoCode.trim()
      });

      if (response.data) {
        setAppliedPromotion(response.data);
        message.success(`Promotion applied: ${response.data.discountPercentage}% off!`);
        setPromoCode("");
      }
    } catch (error) {
      const errorMessage = error.response?.data || "Invalid or expired promotion code";
      message.error(errorMessage);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Remove applied promotion
  const handleRemovePromo = () => {
    setAppliedPromotion(null);
    message.info("Promotion removed");
  };

  // Calculate original total (without discounts)
  const originalTotal = cartItems.reduce((acc, item) => {
    if (!item?.productColor?.product) return acc;
    const price = item.productColor.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Calculate product savings (from salePrice)
  const productSavings = originalTotal - cartTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: "sticky", top: "5rem" }}
    >
      <Card
        title={<Title level={4}>Order Summary</Title>}
        style={{ width: "100%" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Items overview */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {cartItems.map((item) => {
              // Check if item has the required structure
              if (!item?.productColor?.product) return null;

              const product = item.productColor.product;
              const price = product.salePrice || product.price || 0;
              const name = product.name || "Product";

              return (
                <div
                  key={item.cartDetailId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.875rem",
                  }}
                >
                  <Text type="secondary" ellipsis>
                    {name}{" "}
                    <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                      x{item.quantity}
                    </Text>
                  </Text>
                  <Text>{(price * item.quantity).toLocaleString('vi-VN')} ₫</Text>
                </div>
              );
            })}
          </div>

          <Divider />

          {/* Order details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <Text type="secondary">
                Subtotal (
                {cartItems.filter((item) => item?.productColor?.product).length}{" "}
                items)
              </Text>
              <Text>{cartTotal.toLocaleString('vi-VN')} ₫</Text>
            </div>

            {productSavings > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <Text type="success">Product Savings</Text>
                <Text type="success">-{productSavings.toLocaleString('vi-VN')} ₫</Text>
              </div>
            )}

            {appliedPromotion && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <Text type="success">
                  Promo Discount ({appliedPromotion.discountPercentage}%)
                </Text>
                <Text type="success">-{discountAmount.toLocaleString('vi-VN')} ₫</Text>
              </div>
            )}
          </div>

          {/* Promo code */}
          {appliedPromotion ? (
            <div 
              style={{ 
                padding: "12px", 
                backgroundColor: "#f6ffed", 
                border: "1px solid #b7eb8f",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                <div>
                  <Text strong style={{ fontSize: "0.875rem" }}>
                    {appliedPromotion.promotionCode}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "0.75rem" }}>
                    {appliedPromotion.name}
                  </Text>
                </div>
              </div>
              <Button 
                type="text" 
                size="small"
                icon={<X size={14} />}
                onClick={handleRemovePromo}
                style={{ color: "#52c41a" }}
              />
            </div>
          ) : (
            <motion.form
              onSubmit={handleApplyPromo}
              style={{ display: "flex", gap: "8px" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              <Button
                type="default"
                htmlType="submit"
                icon={<TagOutlined />}
                loading={isApplyingPromo}
                disabled={!promoCode || isApplyingPromo}
              >
                Apply
              </Button>
            </motion.form>
          )}

          <Divider />

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            <Text>Total</Text>
            <Text style={{ fontSize: "1.25rem" }}>
              {finalTotal.toLocaleString('vi-VN')} ₫
            </Text>
          </div>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              style={{
                width: "100%",
                padding: "12px 24px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                opacity: isProcessing ? 0.5 : 1,
                pointerEvents: isProcessing ? "none" : "auto",
              }}
            >
              {isProcessing ? "Processing..." : "Place Order"}
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Payment Info */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "0.75rem",
              color: "rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <CreditCard
                style={{ marginRight: "8px", width: "16px", height: "16px" }}
              />
              <Text type="secondary">
                We accept all major credit cards, PayPal, and Apple Pay
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ShieldCheck
                style={{ marginRight: "8px", width: "16px", height: "16px" }}
              />
              <Text type="secondary">
                Your payment information is processed securely
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
