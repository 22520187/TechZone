import { Routes, Route } from "react-router-dom";
import Home from "../pages/User/Home";
import NotFound from "../pages/NotFound/NotFound";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import ForgorPassword from "../pages/ForgotPassword/Forgotpassword";

const AllUserRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgorPassword />} />
        </Routes>
    )
}
export default AllUserRoutes;