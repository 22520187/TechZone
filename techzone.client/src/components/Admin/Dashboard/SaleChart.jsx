import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { fetchSalesChart } from "../../../features/Admin/Dashboard/Dashboard";

const SalesChart = () => {
    const dispatch = useDispatch();
    const { salesChart, loading } = useSelector((state) => state.dashboard);
    const [selectedDays, setSelectedDays] = useState(30);

    useEffect(() => {
        dispatch(fetchSalesChart(selectedDays));
    }, [dispatch, selectedDays]);

    // Transform data for chart
    const chartData = salesChart?.salesData?.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        amount: item.amount,
        orderCount: item.orderCount,
    })) || [];

    // Format currency for VND
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700">
                        {payload[0].payload.date}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                        {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {payload[0].payload.orderCount} orders
                    </p>
                </div>
            );
        }
        return null;
    };

    const handleDaysChange = (e) => {
        setSelectedDays(Number(e.target.value));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Sales Details</h2>
                <div className="relative">
                    <select 
                        className="appearance-none pl-4 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        value={selectedDays}
                        onChange={handleDaysChange}
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={60}>Last 60 days</option>
                        <option value={90}>Last 90 days</option>
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

            <div className="w-full h-64">
                {loading.salesChart ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-pulse bg-gray-200 rounded-md w-full h-48"></div>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="colorSales"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3b82f6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                                tickLine={false}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorSales)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No sales data available
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SalesChart;
