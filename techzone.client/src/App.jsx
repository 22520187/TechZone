import "@ant-design/v5-patch-for-react-19";

import AllUserRoutes from "./routes/AllUserRoutes";
import Navbar from "./components/User/Navbar/Navbar";
import "./App.css";
import { useSelector } from "react-redux";
import AdminLayout from "./components/Admin/Layout/AdminLayout";
import AllAdminRoutes from "./routes/AllAdminRoutes";
import AIChatButton from "./components/User/Chat/AIChatButton";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
    const userRole = useSelector((state) => state.auth.userRole);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return (
        <div>
            <Routes>
                {/* Admin routes */}
                <Route 
                    path="/admin/*" 
                    element={
                        isAuthenticated && userRole?.toLowerCase() === "admin" ? (
                            <AdminLayout>
                                <AllAdminRoutes />
                            </AdminLayout>
                        ) : (
                            <Navigate to="/auth/login" replace />
                        )
                    } 
                />
                
                {/* User routes */}
                <Route 
                    path="/*" 
                    element={
                        <div className="min-h-screen bg-bg">
                            <Navbar />
                            <AllUserRoutes />
                            <AIChatButton />
                        </div>
                    } 
                />
            </Routes>
        </div>
    );
}

export default App;
