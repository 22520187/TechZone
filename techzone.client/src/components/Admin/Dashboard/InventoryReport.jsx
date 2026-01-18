import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Package, Search, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { fetchInventoryReport } from "../../../features/Admin/Dashboard/Dashboard";

const InventoryReport = () => {
    const dispatch = useDispatch();
    const { inventoryReport, loading } = useSelector((state) => state.dashboard);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        dispatch(fetchInventoryReport({ search: searchTerm, category: categoryFilter }));
    }, [dispatch, searchTerm, categoryFilter]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Get stock status badge
    const getStockBadge = (status) => {
        const badges = {
            "In Stock": "text-green-800 bg-green-100",
            "Low Stock": "text-yellow-800 bg-yellow-100",
            "Out of Stock": "text-red-800 bg-red-100",
        };
        return badges[status] || "text-gray-800 bg-gray-100";
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {loading.inventoryReport ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <motion.div
                            className="bg-white rounded-xl shadow-sm p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Total Products</p>
                                    <p className="text-2xl font-semibold mt-1">
                                        {inventoryReport?.totalProducts || 0}
                                    </p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-sm p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Low Stock</p>
                                    <p className="text-2xl font-semibold mt-1 text-yellow-600">
                                        {inventoryReport?.lowStockProducts || 0}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-sm p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Out of Stock</p>
                                    <p className="text-2xl font-semibold mt-1 text-red-600">
                                        {inventoryReport?.outOfStockProducts || 0}
                                    </p>
                                </div>
                                <div className="bg-red-100 p-3 rounded-full">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-xl shadow-sm p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Inventory Value</p>
                                    <p className="text-2xl font-semibold mt-1">
                                        {formatCurrency(inventoryReport?.totalInventoryValue || 0)}
                                    </p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Product Inventory Table */}
            <motion.div
                className="bg-white rounded-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-lg font-medium text-gray-800">Product Inventory</h2>
                    
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading.inventoryReport ? (
                        <div className="animate-pulse space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex space-x-4 py-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : inventoryReport?.productStocks && inventoryReport.productStocks.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 rounded-l-lg">
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Brand
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Total Stock
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                        Colors
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 rounded-r-lg">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryReport.productStocks.map((product) => (
                                    <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                                    {product.productImage ? (
                                                        <img
                                                            src={product.productImage}
                                                            alt={product.productName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium max-w-xs truncate">
                                                    {product.productName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {product.categoryName || "N/A"}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {product.brandName || "N/A"}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold">
                                            {product.totalStock}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-1">
                                                {product.colorStocks.map((color) => (
                                                    <div
                                                        key={color.productColorId}
                                                        className="group relative"
                                                    >
                                                        <div
                                                            className="w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer"
                                                            style={{ backgroundColor: color.colorCode }}
                                                        ></div>
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            {color.color}: {color.stockQuantity}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${getStockBadge(
                                                    product.stockStatus
                                                )}`}
                                            >
                                                {product.stockStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No inventory data available
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default InventoryReport;
