import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { message } from "antd";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { ProductImageCarousel } from "../../../components/User/ProductDetail/ProductImageCarousel";
import ProductReviews from "../../../components/User/ProductDetail/ProductReviews";
import api from "../../../features/AxiosInstance/AxiosInstance";
import { addItemToCart } from "../../../features/Cart/Cart";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartId = useSelector((state) => state.cart.cartId);
  const cartItems = useSelector((state) => state.cart.items);

  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableStock, setAvailableStock] = useState(0);

  //#region fetch data
  const fetchProduct = async () => {
    try {
      const response = await api.get(
        `/api/Product/AdminGetProductById/${id}`
      );
      const data = response.data;
      const mappedData = {
        id: data.productId,
        name: data.name,
        description: data.description,
        longDescription: data.longDescription || "",
        price: data.salePrice || data.price,
        oldPrice: data.price,
        stockQuantity: data.stockQuantity,
        categoryId: data.category.categoryId,
        categoryName: data.category.categoryName,
        brandId: data.brand.brandId,
        brandName: data.brand.brandName,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        images: data.productImages && data.productImages.length > 0
          ? data.productImages.map(img => img.imageUrl)
          : [
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
            ],
        productColors: data.productColors.map((color) => ({
          id: color.productColorId,
          name: color.color,
          code: color.colorCode,
          stock: color.stockQuantity,
        })),
        createdAt: data.createdAt,
      };
      // Calculate total stock from all colors
      const totalStock = mappedData.productColors.reduce(
        (sum, color) => sum + color.stock,
        0
      );
      mappedData.stockQuantity = totalStock;
      setProduct(mappedData);
      setAvailableStock(totalStock);

      // Map reviews from API response if available
      if (data.reviews && data.reviews.length > 0) {
        const mappedReviews = data.reviews.map((review) => ({
          id: review.reviewId,
          userId: review.userId,
          userName: review.userName || "Anonymous",
          userAvatar:
            review.userAvatar ||
            `https://i.pravatar.cc/150?img=${review.userId}`,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          helpfulCount: 0, // Default value since it's not in the API
        }));
        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      message.error("Error fetching product: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);
  //#endregion

  const handleAddToCart = async () => {
    if (!selectedColor) {
      message.warning("Please select a color before adding to cart");
      return;
    }

    if (!cartId) {
      message.error("Cart not found. Please try again later.");
      return;
    }

    // Use cart items from the component level

    // Check if this product color is already in the cart
    const existingCartItem = cartItems.find(
      (item) => item.productColor.productColorId === selectedColor.id
    );

    console.log(cartItems);
    console.log(selectedColor.id);

    // Calculate total quantity (existing + new)
    const existingQuantity = existingCartItem ? existingCartItem.quantity : 0;
    const totalQuantity = existingQuantity + quantity;

    console.log(totalQuantity);
    console.log(selectedColor.stock);

    // Check if total quantity exceeds available stock
    if (totalQuantity > selectedColor.stock) {
      message.error(
        `Cannot add ${quantity} items to cart. You already have ${existingQuantity} in your cart and the total would exceed the available stock of ${selectedColor.stock}.`
      );
      return;
    }

    try {
      const itemData = {
        cartId: cartId,
        productColorId: selectedColor.id,
        quantity: quantity,
      };

      await dispatch(addItemToCart(itemData)).unwrap();
      message.success(`${product.name} added to cart successfully!`);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      message.error("Failed to add item to cart. Please try again.");
    }
  };

  // Handle quantity change
  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setAvailableStock(color.stock);
    // Reset quantity if it exceeds new stock
    if (quantity > color.stock) {
      setQuantity(1);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  const handleBackToProducts = () => navigate("/admin/products");

  return (
    <motion.div
      className="container mx-auto px-4 md:px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.button
        onClick={handleBackToProducts}
        className="flex items-center cursor-pointer text-primary-300 hover:text-primary-500 transition mb-2 group"
        whileHover={{ x: -5 }}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span>Back to Products</span>
      </motion.button>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProductImageCarousel
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="flex flex-col space-y-4">
            {/* Title and Brand */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                {product.name}
              </h1>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground">By </span>
                <span className="ml-1 font-medium">{product.brandName}</span>
                <span className="mx-2 text-muted-foreground">in</span>
                <div className=" px-2 py-1 text-sm font-medium bg-primary-100 rounded">
                  {product.categoryName}
                </div>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted fill-muted"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                </svg>
              ))}
              <div className="text-sm font-medium ml-1">{product.rating}</div>
              <div className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold">
                {product.price ? product.price.toLocaleString('vi-VN') : "0"} ₫
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-muted-foreground line-through">
                  {product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') : "0"} ₫
                </span>
              )}
              {product.oldPrice && product.oldPrice > product.price && (
                <div className="ml-2 px-2 py-1 text-sm font-medium bg-red-300 rounded">
                  Tiết kiệm
                  {product.oldPrice && product.price
                    ? " " + (product.oldPrice - product.price).toLocaleString('vi-VN')
                    : " 0"} ₫
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Additional Details & Specs */}
      <motion.div
        className="pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-96">
          <div
            className="prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: product.longDescription }}
          />
        </div>
      </motion.div>
      <ProductReviews
        reviews={reviews}
        productId={product.id}
        averageRating={product.rating}
        totalReviews={product.reviewCount}
      />
    </motion.div>
  );
}
