import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Users,
    DollarSign,
    Package,
    ArrowUp,
    ArrowDown,
    Clock,
} from "lucide-react";
import SalesChart from "./SaleChart";
import InventoryReport from "./InventoryReport";
import TopProducts from "./TopProducts";
import { 
    fetchDashboardStatistics, 
    fetchRecentOrders 
} from "../../../features/Admin/Dashboard/Dashboard";

const DashboardContent = () => {
    const dispatch = useDispatch();
    const { statistics, recentOrders, loading } = useSelector(
        (state) => state.dashboard
    );
    
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const generateMonthOptions = () => {
        const months = [];
        const now = new Date();
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            months.push({ value, label });
        }
        
        return months;
    };

    const monthOptions = generateMonthOptions();

    useEffect(() => {
        dispatch(fetchDashboardStatistics());
        
        const [year, month] = selectedMonth.split('-').map(Number);
        dispatch(fetchRecentOrders({ limit: 10, month, year }));
    }, [dispatch, selectedMonth]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format number with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat("en-US").format(num);
    };

    // Format date and time
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Create stats items from API data
    const statsItems = statistics
        ? [
              {
                  title: "Total User",
                  value: formatNumber(statistics.totalUsers),
                  icon: Users,
                  iconBg: "bg-blue-100",
                  trend: `${statistics.userGrowthPercentage > 0 ? "+" : ""}${statistics.userGrowthPercentage}% ${
                      statistics.userGrowthPercentage >= 0 ? "Up" : "Down"
                  } from yesterday`,
                  trendUp: statistics.userGrowthPercentage >= 0,
                  trendIcon:
                      statistics.userGrowthPercentage >= 0 ? ArrowUp : ArrowDown,
                  trendClass:
                      statistics.userGrowthPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500",
              },
              {
                  title: "Total Order",
                  value: formatNumber(statistics.totalOrders),
                  icon: Package,
                  iconBg: "bg-yellow-100",
                  trend: `${statistics.orderGrowthPercentage > 0 ? "+" : ""}${statistics.orderGrowthPercentage}% ${
                      statistics.orderGrowthPercentage >= 0 ? "Up" : "Down"
                  } from past week`,
                  trendUp: statistics.orderGrowthPercentage >= 0,
                  trendIcon:
                      statistics.orderGrowthPercentage >= 0
                          ? ArrowUp
                          : ArrowDown,
                  trendClass:
                      statistics.orderGrowthPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500",
              },
              {
                  title: "Total Sales",
                  value: formatCurrency(statistics.totalSales),
                  icon: DollarSign,
                  iconBg: "bg-green-100",
                  trend: `${statistics.salesGrowthPercentage > 0 ? "+" : ""}${statistics.salesGrowthPercentage}% ${
                      statistics.salesGrowthPercentage >= 0 ? "Up" : "Down"
                  } from yesterday`,
                  trendUp: statistics.salesGrowthPercentage >= 0,
                  trendIcon:
                      statistics.salesGrowthPercentage >= 0
                          ? ArrowUp
                          : ArrowDown,
                  trendClass:
                      statistics.salesGrowthPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500",
              },
              {
                  title: "Total Pending",
                  value: formatNumber(statistics.totalPending),
                  icon: Clock,
                  iconBg: "bg-orange-100",
                  trend: `${statistics.pendingGrowthPercentage > 0 ? "+" : ""}${statistics.pendingGrowthPercentage}% ${
                      statistics.pendingGrowthPercentage >= 0 ? "Up" : "Down"
                  } from yesterday`,
                  trendUp: statistics.pendingGrowthPercentage >= 0,
                  trendIcon:
                      statistics.pendingGrowthPercentage >= 0
                          ? ArrowUp
                          : ArrowDown,
                  trendClass:
                      statistics.pendingGrowthPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500",
              },
          ]
        : [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
                {loading.statistics ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                        </div>
                    ))
                ) : (
                    statsItems.map((item, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl shadow-sm p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {item.title}
                                    </p>
                                    <p className="text-2xl font-semibold mt-1">
                                        {item.value}
                                    </p>
                                </div>
                                <div className={`${item.iconBg} p-3 rounded-full`}>
                                    <item.icon className="h-5 w-5 text-dashblue" />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <item.trendIcon
                                    className={`h-4 w-4 ${item.trendClass} mr-1`}
                                />
                                <span className={`text-xs ${item.trendClass}`}>
                                    {item.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <motion.div
                className="bg-white rounded-xl shadow-sm mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <SalesChart />
            </motion.div>

            <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800">
                        Deals Details
                    </h2>
                    <div className="relative">
                        <select 
                            className="appearance-none pl-4 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                        >
                            {monthOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading.recentOrders ? (
                        <div className="animate-pulse space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex space-x-4 py-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentOrders && recentOrders.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 rounded-l-lg">
                                        Product Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Date - Time
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 rounded-r-lg">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.orderId} className="">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                                                    {order.productImage ? (
                                                        <img
                                                            src={order.productImage}
                                                            alt={order.productName}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {order.productName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {order.customerName}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {formatDateTime(order.orderDate)}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {order.quantity}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    order.status === "COMPLETED"
                                                        ? "text-green-800 bg-green-100"
                                                        : order.status === "PENDING"
                                                        ? "text-yellow-800 bg-yellow-100"
                                                        : order.status === "CANCELLED"
                                                        ? "text-red-800 bg-red-100"
                                                        : "text-blue-800 bg-blue-100"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No recent orders available
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Inventory Report Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
            >
                <InventoryReport />
            </motion.div>

            {/* Top Products Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
            >
                <TopProducts />
            </motion.div>
        </div>
    );
};

export default DashboardContent;
