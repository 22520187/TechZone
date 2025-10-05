import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const mockOrders = [
  {
    id: "ORD2509",
    status: "COMPLETED",
    date: new Date("2025-09-28"),
    total: 29990000,
    items: [
      { name: "iPhone 15 Pro", quantity: 1, price: 29990000 }
    ]
  },
  {
    id: "ORD2510", 
    status: "PROCESSING",
    date: new Date("2025-09-29"),
    total: 45990000,
    items: [
      { name: "MacBook Air M3", quantity: 1, price: 45990000 }
    ]
  },
  {
    id: "ORD2511",
    status: "PENDING CONFIRM",
    date: new Date("2025-09-30"),
    total: 12990000,
    items: [
      { name: "Samsung Galaxy S24", quantity: 1, price: 12990000 }
    ]
  },
  {
    id: "ORD2512",
    status: "CANCELLED",
    date: new Date("2025-09-27"),
    total: 19990000,
    items: [
      { name: "iPad Air", quantity: 1, price: 19990000 }
    ]
  },
  {
    id: "ORD2513",
    status: "COMPLETED",
    date: new Date("2025-09-26"),
    total: 59990000,
    items: [
      { name: "Gaming PC", quantity: 1, price: 49990000 },
      { name: "Gaming Monitor", quantity: 1, price: 9990000 }
    ]
  }
];


const OrderHistory = () => {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

   useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000); // Giả lập delay API
  }, []);

  const getPaginationNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "text-green-600";
      case "PROCESSING":
        return "text-blue-600";
      case "PENDING CONFIRM":
      case "PENDING":
        return "text-amber-600";
      case "CANCELLED":
      case "CANCELED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "PROCESSING":
        return <CogIcon className="h-5 w-5" />;
      case "PENDING CONFIRM":
      case "PENDING":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case "CANCELLED":
      case "CANCELED":
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";

    switch (status.toUpperCase()) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "PROCESSING":
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case "PENDING CONFIRM":
      case "PENDING":
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
      case "CANCELLED":
      case "CANCELED":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-xl font-bold mb-4 text-primary-600">ORDER HISTORY</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-500 rounded-lg p-8 text-center">
          <p className="text-gray-600">You don't have any orders yet</p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm mb-6">
          <div className="grid grid-cols-12 bg-gray-100 py-3 px-4 border-b border-gray-200">
            <div className="col-span-2 font-medium text-gray-700">Order ID</div>
            <div className="col-span-2 font-medium text-gray-700">Status</div>
            <div className="col-span-3 font-medium text-gray-700">Order Date</div>
            <div className="col-span-3 font-medium text-gray-700">Total Amount</div>
            <div className="col-span-2 font-medium text-gray-700">Action</div>
          </div>

          {paginatedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 py-4 px-4 border-b border-gray-100 hover:bg-white hover:shadow-sm transition-200 duration-200"
            >
              <div className="col-span-2 font-medium">#{order.id}</div>
              <div className="col-span-2 flex items-center">
                <div className={getStatusBadge(order.status)}>
                  <span className={`mr-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </span>
                  <span className="capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="col-span-3 text-gray-600">
                {formatDate(order.date)}
              </div>
              <div className="col-span-3 text-gray-600">{order.total}</div>
              <div className="col-span-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-blue-500 flex items-center hover:text-blue-700 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(order.id)}
                >
                  View Details <ChevronRight size={16} className="ml-1" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center my-8">
          <div className="relative inline-block text-left">
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 items/page</option>
              <option value={10}>10 items/page</option>
              <option value={20}>20 items/page</option>
              <option value={50}>50 items/page</option>
            </select>
          </div>

          <div className="flex justify-center items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ArrowLeft size={18} />
            </motion.button>

            {getPaginationNumbers().map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                  currentPage === page
                    ? "bg-primary-500 text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                } transition-colors`}
                onClick={() => setCurrentPage(page)}
              >
                {page.toString().padStart(2, "0")}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </div>
      )}

      {loading && orders.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-2 rounded-full shadow-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
