import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { message } from "antd";
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  FileCheck,
  FileText,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import TrackingMap from "./TrackingMap";
import RatingModal from "./RatingModal";

const mockOrderDetails = {
  "ORD2509": {
    id: "ORD2509",
    status: "COMPLETED",
    date: new Date("2025-09-28"),
    total: 29990000,
    productCount: 1,
    orderDate: "28/09/2025",
    totalAmount: "29,990,000 VND",
    expectedDelivery: "30/09/2025",
    currentStep: 4,
    customer: {
      name: "Nguyen Van A",
      phone: "0123456789",
      email: "nguyenvana@example.com",
      address: "123 Nguyen Van B, Quan 1, TP.HCM"
    },
    paymentMethod: "COD",
    items: [
      { 
        name: "iPhone 15 Pro", 
        quantity: 1, 
        price: 29990000,
        image: "https://example.com/iphone15pro.jpg"
      }
    ],
    products: [
      {
        productId: "P001",
        category: "Smartphone",
        name: "iPhone 15 Pro",
        color: "Natural Titanium",
        price: "29,990,000 VND",
        quantity: 1,
        subtotal: "29,990,000 VND",
        isRated: false
      }
    ],
    activities: [
      {
        icon: CheckCircle2,
        color: "text-green-500",
        description: "Order delivered successfully",
        date: "28/09/2025 - 16:30"
      },
      {
        icon: Truck,
        color: "text-blue-500",
        description: "Order is out for delivery",
        date: "28/09/2025 - 14:00"
      },
      {
        icon: Package,
        color: "text-orange-500",
        description: "Order confirmed and being prepared",
        date: "28/09/2025 - 10:15"
      },
      {
        icon: FileCheck,
        color: "text-purple-500",
        description: "Order placed successfully",
        date: "28/09/2025 - 10:00"
      }
    ],
    addresses: {
      billing: {
        name: "Nguyen Van A",
        address: "123 Nguyen Van B, Quan 1, TP.HCM"
      },
      shipping: {
        name: "Nguyen Van A",
        address: "123 Nguyen Van B, Quan 1, TP.HCM"
      }
    },
    notes: "Please call before delivery",
    timeline: [
      { status: "ORDER_PLACED", date: new Date("2025-09-28T10:00:00") },
      { status: "CONFIRMED", date: new Date("2025-09-28T10:15:00") },
      { status: "SHIPPING", date: new Date("2025-09-28T14:00:00") },
      { status: "COMPLETED", date: new Date("2025-09-28T16:30:00") }
    ]
  },
  "ORD2510": {
    id: "ORD2510",
    status: "PROCESSING",
    date: new Date("2025-09-29"),
    total: 45990000,
    productCount: 1,
    orderDate: "29/09/2025",
    totalAmount: "45,990,000 VND",
    expectedDelivery: "02/10/2025",
    currentStep: 2,
    customer: {
      name: "Tran Thi B",
      phone: "0987654321",
      email: "tranthib@example.com",
      address: "456 Le Van C, Quan 2, TP.HCM"
    },
    paymentMethod: "Bank Transfer",
    items: [
      { 
        name: "MacBook Air M3", 
        quantity: 1, 
        price: 45990000,
        image: "https://example.com/macbookair.jpg"
      }
    ],
    products: [
      {
        productId: "P002",
        category: "Laptop",
        name: "MacBook Air M3",
        color: "Space Gray",
        price: "45,990,000 VND",
        quantity: 1,
        subtotal: "45,990,000 VND",
        isRated: false
      }
    ],
    activities: [
      {
        icon: Package,
        color: "text-orange-500",
        description: "Order is being processed",
        date: "29/09/2025 - 10:00"
      },
      {
        icon: CheckCircle2,
        color: "text-green-500",
        description: "Order confirmed",
        date: "29/09/2025 - 09:30"
      },
      {
        icon: FileCheck,
        color: "text-purple-500",
        description: "Order placed successfully",
        date: "29/09/2025 - 09:00"
      }
    ],
    addresses: {
      billing: {
        name: "Tran Thi B",
        address: "456 Le Van C, Quan 2, TP.HCM"
      },
      shipping: {
        name: "Tran Thi B",
        address: "456 Le Van C, Quan 2, TP.HCM"
      }
    },
    notes: "Handle with care - fragile item",
    timeline: [
      { status: "ORDER_PLACED", date: new Date("2025-09-29T09:00:00") },
      { status: "CONFIRMED", date: new Date("2025-09-29T09:30:00") },
      { status: "PROCESSING", date: new Date("2025-09-29T10:00:00") }
    ]
  },
  "ORD2511": {
    id: "ORD2511",
    status: "PENDING CONFIRM",
    date: new Date("2025-09-30"),
    total: 12990000,
    productCount: 1,
    orderDate: "30/09/2025",
    totalAmount: "12,990,000 VND",
    expectedDelivery: "03/10/2025",
    currentStep: 1,
    customer: {
      name: "Le Van C",
      phone: "0369852147",
      email: "levanc@example.com",
      address: "789 Pham Van D, Quan 3, TP.HCM"
    },
    paymentMethod: "Momo",
    items: [
      { 
        name: "Samsung Galaxy S24", 
        quantity: 1, 
        price: 12990000,
        image: "https://example.com/galaxys24.jpg"
      }
    ],
    products: [
      {
        productId: "P003",
        category: "Smartphone",
        name: "Samsung Galaxy S24",
        color: "Phantom Black",
        price: "12,990,000 VND",
        quantity: 1,
        subtotal: "12,990,000 VND",
        isRated: false
      }
    ],
    activities: [
      {
        icon: FileCheck,
        color: "text-purple-500",
        description: "Order placed, waiting for confirmation",
        date: "30/09/2025 - 11:00"
      }
    ],
    addresses: {
      billing: {
        name: "Le Van C",
        address: "789 Pham Van D, Quan 3, TP.HCM"
      },
      shipping: {
        name: "Le Van C",
        address: "789 Pham Van D, Quan 3, TP.HCM"
      }
    },
    notes: "No special instructions",
    timeline: [
      { status: "ORDER_PLACED", date: new Date("2025-09-30T11:00:00") }
    ]
  },
  "ORD2512": {
    id: "ORD2512",
    status: "CANCELLED",
    date: new Date("2025-09-27"),
    total: 19990000,
    productCount: 1,
    orderDate: "27/09/2025",
    totalAmount: "19,990,000 VND",
    expectedDelivery: "N/A",
    currentStep: 0,
    customer: {
      name: "Pham Thi D",
      phone: "0741852963",
      email: "phamthid@example.com",
      address: "321 Tran Van E, Quan 4, TP.HCM"
    },
    paymentMethod: "Credit Card",
    items: [
      { 
        name: "iPad Air", 
        quantity: 1, 
        price: 19990000,
        image: "https://example.com/ipadair.jpg"
      }
    ],
    products: [
      {
        productId: "P004",
        category: "Tablet",
        name: "iPad Air",
        color: "Space Gray",
        price: "19,990,000 VND",
        quantity: 1,
        subtotal: "19,990,000 VND",
        isRated: false
      }
    ],
    activities: [
      {
        icon: FileText,
        color: "text-red-500",
        description: "Order cancelled by customer",
        date: "27/09/2025 - 14:00"
      },
      {
        icon: FileCheck,
        color: "text-purple-500",
        description: "Order placed successfully",
        date: "27/09/2025 - 13:00"
      }
    ],
    addresses: {
      billing: {
        name: "Pham Thi D",
        address: "321 Tran Van E, Quan 4, TP.HCM"
      },
      shipping: {
        name: "Pham Thi D",
        address: "321 Tran Van E, Quan 4, TP.HCM"
      }
    },
    notes: "Order cancelled due to payment issues",
    timeline: [
      { status: "ORDER_PLACED", date: new Date("2025-09-27T13:00:00") },
      { status: "CANCELLED", date: new Date("2025-09-27T14:00:00") }
    ]
  },
  "ORD2513": {
    id: "ORD2513",
    status: "COMPLETED",
    date: new Date("2025-09-26"),
    total: 59990000,
    productCount: 2,
    orderDate: "26/09/2025",
    totalAmount: "59,990,000 VND",
    expectedDelivery: "28/09/2025",
    currentStep: 4,
    customer: {
      name: "Hoang Van E",
      phone: "0159753468",
      email: "hoangvane@example.com",
      address: "147 Nguyen Hue, Quan 5, TP.HCM"
    },
    paymentMethod: "Bank Transfer",
    items: [
      { 
        name: "Gaming PC", 
        quantity: 1, 
        price: 49990000,
        image: "https://example.com/gamingpc.jpg"
      },
      { 
        name: "Gaming Monitor", 
        quantity: 1, 
        price: 9990000,
        image: "https://example.com/monitor.jpg"
      }
    ],
    products: [
      {
        productId: "P005",
        category: "Computer",
        name: "Gaming PC",
        color: "RGB Black",
        price: "49,990,000 VND",
        quantity: 1,
        subtotal: "49,990,000 VND",
        isRated: false
      },
      {
        productId: "P006",
        category: "Monitor",
        name: "Gaming Monitor",
        color: "Black",
        price: "9,990,000 VND",
        quantity: 1,
        subtotal: "9,990,000 VND",
        isRated: false
      }
    ],
    activities: [
      {
        icon: CheckCircle2,
        color: "text-green-500",
        description: "Order delivered successfully",
        date: "26/09/2025 - 18:30"
      },
      {
        icon: Truck,
        color: "text-blue-500",
        description: "Order is out for delivery",
        date: "26/09/2025 - 17:00"
      },
      {
        icon: Package,
        color: "text-orange-500",
        description: "Order confirmed and being prepared",
        date: "26/09/2025 - 15:30"
      },
      {
        icon: FileCheck,
        color: "text-purple-500",
        description: "Order placed successfully",
        date: "26/09/2025 - 15:00"
      }
    ],
    addresses: {
      billing: {
        name: "Hoang Van E",
        address: "147 Nguyen Hue, Quan 5, TP.HCM"
      },
      shipping: {
        name: "Hoang Van E",
        address: "147 Nguyen Hue, Quan 5, TP.HCM"
      }
    },
    notes: "Large items - please arrange for proper delivery",
    timeline: [
      { status: "ORDER_PLACED", date: new Date("2025-09-26T15:00:00") },
      { status: "CONFIRMED", date: new Date("2025-09-26T15:30:00") },
      { status: "SHIPPING", date: new Date("2025-09-26T17:00:00") },
      { status: "COMPLETED", date: new Date("2025-09-26T18:30:00") }
    ]
  }
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const orderDetail = mockOrderDetails[orderId];
      if (orderDetail) {
        setOrderData(orderDetail);
        setError(null);
      } else {
        setError("Order not found");
      }
      setLoading(false);
    }, 1000);
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }
  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-yellow-50 rounded-lg p-4 text-yellow-700">
          <p>Order information not found!</p>
          <button
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => navigate("/order-history")}
          >
            Back to Order History
          </button>
        </div>
      </div>
    );
  }

  // Open rating modal
  const openRatingModal = (productId) => {
    setSelectedProductId(productId);
    setIsRatingModalOpen(true);
  };

  // Update product rating status
  const handleRatingSubmit = async (productId, rating, comment) => {
    alert(`Rated product ${productId} with ${rating} stars and comment: ${comment}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 transition-colors text-xl font-bold mb-4 cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2 text-primary-700" /> ORDER
          DETAILS
        </button>
      </div>

      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
          }}
          orderId={orderId}
          productId={selectedProductId}
          orderStatus={orderData?.status}
          onSubmit={handleRatingSubmit}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-800 font-semibold">#{orderData.id}</p>
            <p className="text-gray-600 text-sm">
              {orderData.productCount} Products • Order placed on{" "}
              {orderData.orderDate}
            </p>
          </div>
          <p className="text-blue-500 font-bold text-2xl">
            {orderData.totalAmount}
          </p>
        </div>
      </motion.div>

      {orderData.status.toUpperCase() === "PROCESSING" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <TrackingMap 
            orderId={orderData.id}
            shippingAddress={orderData.addresses.shipping.address}
          />
        </motion.div>
      )}

      <div className="mb-8">
        {orderData.status.toUpperCase() !== "CANCELED" ? (
          <>
            <p className="text-gray-700 mb-4">
              Expected delivery on {orderData.expectedDelivery}
            </p>

            {orderData.status.toUpperCase() !== "PROCESSING" && (
              <div className="relative mb-8">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>

                <div
                  className="absolute top-4 left-0 h-1 bg-primary-500 z-0"
                  style={{ width: `${orderData.currentStep * 25}%` }}
                ></div>

                <div className="flex justify-between relative z-10">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        orderData.currentStep >= 1 ? "bg-primary-500" : "bg-white"
                      } border-4 ${
                        orderData.currentStep >= 1
                          ? "border-white"
                          : "border-gray-200"
                      } flex items-center justify-center mb-2`}
                    >
                      <FileText
                        size={16}
                        className={
                          orderData.currentStep >= 1
                            ? "text-white"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-700">Order Placed</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        orderData.currentStep >= 2 ? "bg-primary-500" : "bg-white"
                      } border-4 ${
                        orderData.currentStep >= 2
                          ? "border-white"
                          : "border-gray-200"
                      } flex items-center justify-center mb-2`}
                    >
                      <Package
                        size={16}
                        className={
                          orderData.currentStep >= 2
                            ? "text-white"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-700">Packaging</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        orderData.currentStep >= 3 ? "bg-primary-500" : "bg-white"
                      } border-4 ${
                        orderData.currentStep >= 3
                          ? "border-white"
                          : "border-gray-200"
                      } flex items-center justify-center mb-2`}
                    >
                      <Truck
                        size={16}
                        className={
                          orderData.currentStep >= 3
                            ? "text-white"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-700">Shipping</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        orderData.currentStep >= 4 ? "bg-primary-500" : "bg-white"
                      } border-4 ${
                        orderData.currentStep >= 4
                          ? "border-white"
                          : "border-gray-200"
                      } flex items-center justify-center mb-2`}
                    >
                      <CheckCircle
                        size={16}
                        className={
                          orderData.currentStep >= 4
                            ? "text-white"
                            : "text-gray-400"
                        }
                      />
                    </div>
                    <p className="text-sm text-gray-700">Delivered</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50 rounded-lg p-4 mb-8">
            <p className="text-red-700 font-medium">
              This order has been canceled.
            </p>
          </div>
        )}
      </div>

      {orderData.status.toUpperCase() !== "PROCESSING" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Activity</h2>

          <div className="space-y-6">
            {orderData.activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <div className="mr-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}
                  >
                    <activity.icon size={18} className={activity.color} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-800">{activity.description}</p>
                  <p className="text-gray-500 text-sm">{activity.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Products ({orderData.products.length})
        </h2>

        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 py-3 px-4 border-b border-gray-200">
            <div className="col-span-5 font-medium text-gray-700">PRODUCT</div>
            <div className="col-span-2 font-medium text-gray-700">PRICE</div>
            <div className="col-span-1 font-medium text-gray-700">QUANTITY</div>
            <div className="col-span-2 font-medium text-gray-700">TOTAL</div>
            <div className="col-span-2 font-medium text-gray-700">RATING</div>
          </div>

          {orderData.products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="grid grid-cols-12 py-4 px-4 border-b border-gray-100"
            >
              <div className="col-span-5">
                <div className="flex">
                  <div className="w-12 h-12 bg-gray-200 rounded-md mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="text-blue-500 text-xs font-medium">
                      {product.category}
                    </p>
                    <p className="text-gray-800 text-sm">{product.name}</p>
                    {product.color && product.color !== "Unknown" && (
                      <p className="text-gray-500 text-xs">
                        Color: {product.color}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2 self-center text-gray-700">
                {product.price}
              </div>
              <div className="col-span-1 self-center text-gray-700">
                {product.quantity}
              </div>
              <div className="col-span-2 self-center text-gray-700 font-medium">
                {product.subtotal}
              </div>
              <div className="col-span-2 self-center">
                {product.isRated ? (
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" className="mr-1" />
                    <span className="text-gray-700">Rated</span>
                  </div>
                ) : orderData?.status?.toUpperCase() === "COMPLETED" ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openRatingModal(product.productId);
                    }}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                  >
                    <Star size={14} className="mr-1" /> Rate
                  </button>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Star size={14} className="mr-1" />
                    <span className="text-sm">
                      {orderData?.status?.toUpperCase() === "CANCELLED"
                        ? "Order Cancelled"
                        : "Complete order to rate"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <h3 className="text-gray-800 font-medium mb-3">Billing Address</h3>
          <div className="bg-green-50 p-4 rounded-lg h-full">
            <p className="font-medium mb-1">
              {orderData.addresses.billing.name}
            </p>
            <p className="text-gray-600 text-sm">
              {orderData.addresses.billing.address}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-gray-800 font-medium mb-3">Shipping Address</h3>
          <div className="bg-orange-50 p-4 rounded-lg h-full">
            <p className="font-medium mb-1">
              {orderData.addresses.shipping.name}
            </p>
            <p className="text-gray-600 text-sm">
              {orderData.addresses.shipping.address}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-gray-800 font-medium mb-3">Order Notes</h3>
          <div className="bg-blue-50 p-4 rounded-lg h-full">
            <p className="text-gray-600 text-sm">{orderData.notes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
