import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import NotFound from "../pages/NotFound/NotFound";
import Products from "../pages/User/Products/Products";
import ProductDetail from "../pages/User/ProductDetail/ProductDetail";
import Cart from "../pages/User/Cart/Cart";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import VerifyCode from "../pages/VerifyCode/VerifyCode";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import OrderHistory from "../pages/User/Order/OrderHistory";
import OrderDetail from "../pages/User/Order/OrderDetail";
import Setting from "../pages/User/Setting";
import Chatbot from "../pages/User/Chatbot";
import Checkout from "../pages/User/Checkout/Checkout";
import CheckoutSuccess from "../pages/User/Checkout/CheckoutSuccess";
import VNPayReturn from "../pages/User/Checkout/VNPayReturn";
import AboutUs from "../pages/User/AboutUs/AboutUs";
import WarrantyList from "../pages/User/Warranty/WarrantyList";
import WarrantyDetail from "../pages/User/Warranty/WarrantyDetail";
import WarrantyClaimHistory from "../pages/User/Warranty/WarrantyClaimHistory";
const AllUserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-code" element={<VerifyCode />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/vnpay-return" element={<VNPayReturn />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/warranty" element={<WarrantyList />} />
            <Route path="/warranty/:warrantyId" element={<WarrantyDetail />} />
            <Route path="/warranty-claims" element={<WarrantyClaimHistory />} />
        </Routes>
    )
}
export default AllUserRoutes;