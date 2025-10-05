import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import ForgotPassword from "../pages/ForgotPassword/Forgotpassword";
import OrderHistory from "../pages/User/Order/OrderHistory";
import OrderDetail from "../pages/User/Order/OrderDetail";
import Setting from "../pages/User/Setting";
import Chatbot from "../pages/User/Chatbot";
const AllUserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/chat" element={<Chatbot />} />

        </Routes>
    )
}
export default AllUserRoutes;