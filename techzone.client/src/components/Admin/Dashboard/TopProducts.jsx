import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { fetchTopProducts } from "../../../features/Admin/Dashboard/Dashboard";

const TopProducts = () => {
    const dispatch = useDispatch();
    const { topProducts, loading } = useSelector((state) => state.dashboard);
    const [activeTab, setActiveTab] = useState("bestSellers"); // 'bestSellers' or 'leastSellers'

    useEffect(() => {
        dispatch(fetchTopProducts(10));
    }, [dispatch]);

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

    const products = activeTab === "bestSellers" 
        ? topProducts?.bestSellers || []
        : topProducts?.leastSellers || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
        >
            {/* Header with Tabs */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Top Products
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab("bestSellers")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === "bestSellers"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            Best Sellers
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("leastSellers")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === "leastSellers"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingDown size={16} />
                            Least Sellers
                        </div>
                    </button>
                </div>
            </div>

            {/* Products List */}
            {loading.topProducts ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4">Loading products...</p>
                </div>
            ) : products.length > 0 ? (
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.productId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-gray-50 transition-all duration-200"
                        >
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                index === 0 
                                    ? "bg-yellow-100 text-yellow-600" 
                                    : index === 1 
                                    ? "bg-gray-200 text-gray-600"
                                    : index === 2
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-gray-100 text-gray-500"
                            }`}>
                                {index + 1}
                            </div>

                            {/* Product Image */}
                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                {product.productImage ? (
                                    <img
                                        src={product.productImage}
                                        alt={product.productName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                    {product.productName}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {product.brandName && (
                                        <span className="text-xs text-gray-500">
                                            {product.brandName}
                                        </span>
                                    )}
                                    {product.categoryName && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-xs text-gray-500">
                                                {product.categoryName}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-sm font-medium text-primary mt-1">
                                    {formatCurrency(product.price)}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex-shrink-0 text-right">
                                <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                                    <Package size={14} className="text-gray-400" />
                                    {formatNumber(product.totalSold)} sold
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <DollarSign size={12} />
                                    {formatCurrency(product.totalRevenue)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Stock: {formatNumber(product.totalStock)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No products available</p>
                </div>
            )}
        </motion.div>
    );
};

export default TopProducts;
