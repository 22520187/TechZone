import "@ant-design/v5-patch-for-react-19";

import AllUserRoutes from "./routes/AllUserRoutes";
import Navbar from "./components/User/Navbar/Navbar";
import "./App.css";
import { useSelector } from "react-redux";
import AdminLayout from "./components/Admin/Layout/AdminLayout";
import AllAdminRoutes from "./routes/AllAdminRoutes";

function App() {
    // const userRole = useSelector((state) => state.auth.userRole);
    const userRole = "admin";
    // const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const isAuthenticated = true;

    return (
        <div>
            {isAuthenticated && userRole?.toLowerCase() === "admin" ? (
                <AdminLayout>
                    <AllAdminRoutes />
                </AdminLayout>
            ) : (
                <div className="min-h-screen bg-bg">
                    <Navbar />
                    <AllUserRoutes />
                </div>
            )}
        </div>
    );
}

export default App;
