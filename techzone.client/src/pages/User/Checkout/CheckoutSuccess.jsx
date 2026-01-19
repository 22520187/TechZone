import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card, Skeleton, message } from "antd";
import { ShoppingBag, Home, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../../features/AxiosInstance/AxiosInstance";
import ProductCard from "../../../components/User/Products/ProductCard";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: "",
    total: "0.00",
  });
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    // Get order details from URL query params
    const searchParams = new URLSearchParams(location.search);
    const orderNumber = searchParams.get("orderNumber") || "";
    const total = searchParams.get("total") || "0.00";

    setOrderDetails({ orderNumber, total });

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [location]);

  // Fetch recommended products based on order
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Get orderId from URL params
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get("orderNumber");
        
        let response;
        
        // If orderId exists, use the new recommended products API
        if (orderId && !isNaN(parseInt(orderId))) {
          try {
            response = await api.get(`/api/Product/GetRecommendedProductsByOrderId/${orderId}`);
            console.log("Recommended products by order API response:", response.data);
          } catch (orderError) {
            console.warn("Failed to get recommended products by order, falling back to featured products:", orderError);
            // Fallback to featured products if order-based recommendation fails
            response = await api.get("/api/Product/GetFeatureProducts");
          }
        } else {
          // If no orderId, use featured products
          response = await api.get("/api/Product/GetFeatureProducts");
          console.log("Featured products API response:", response.data);
        }
        
        const data = response.data;
        
        // Check if data is valid array
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn("No products returned from API");
          setRecommendedProducts([]);
          setIsLoadingProducts(false);
          return;
        }
        
        // Map and transform the product data to match ProductCard format
        const mappedData = data.map((product) => {
          // Handle imageUrl - check if it's valid
          const imageUrl = product.imageUrl && !product.imageUrl.includes('cdn.techzone.com')
            ? product.imageUrl
            : `https://picsum.photos/300/300?random=${product.productId}`;
          
          return {
            id: product.productId,
            name: product.name || "Unnamed Product",
            price: product.salePrice || product.price || 0,
            oldPrice: product.price || 0,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            image: imageUrl,
            category: product.category?.categoryName || "",
            brand: product.brand?.brandName || "",
          };
        });
        
        console.log("Mapped recommended products:", mappedData);
        
        // Limit to 4 products for recommendation
        setRecommendedProducts(mappedData.slice(0, 4));
      } catch (error) {
        console.error("Error fetching recommended products:", error);
        console.error("Error details:", error.response?.data || error.message);
        message.error("Không thể tải sản phẩm gợi ý");
        setRecommendedProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchRecommendedProducts();
  }, [location.search]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-20 max-w-7xl">
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

      {/* Recommended Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-12"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Gợi ý sản phẩm cho bạn
          </h2>
          <p className="text-muted-foreground">
            Khám phá thêm những sản phẩm tuyệt vời khác
          </p>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border rounded-lg overflow-hidden">
                <Skeleton.Image className="w-full aspect-[4/3]" />
                <Skeleton active paragraph={{ rows: 3 }} className="p-4" />
              </Card>
            ))}
          </div>
        ) : recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Hiện tại chưa có sản phẩm gợi ý. Vui lòng quay lại sau!
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/products")}
              className="mt-4"
              icon={<ShoppingBag className="mr-2 h-4 w-4" />}
            >
              Xem tất cả sản phẩm
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;
