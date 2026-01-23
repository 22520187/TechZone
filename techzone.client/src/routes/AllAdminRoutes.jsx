import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "../pages/Admin/Dashboard";
import NotFound from "../pages/Admin/NotFound";
import Products from "../pages/Admin/Products";
import Brands from "../pages/Admin/Brands";
import Categories from "../pages/Admin/Categories";
import Order from "../pages/Admin/Order/Order";
import Customers from "../pages/Admin/Customer";
import Staff from "../pages/Admin/Staff";
import Promotions from "../pages/Admin/Promotions";
import PromotionDetail from "../pages/Admin/PromotionDetail";
import ProductDetail from "../pages/Admin/ProductDetail";
import Settings from "../pages/Admin/Settings/Settings";
import WarrantyClaims from "../pages/Admin/WarrantyClaims/WarrantyClaims";
import Blog from "../pages/Admin/Blog";

// Component to protect Admin-only routes
const AdminOnly = ({ children }) => {
  const userRole = useSelector((state) => state.auth.userRole);
  const isAdmin = userRole?.toLowerCase() === "admin";
  
  if (!isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }
  
  return children;
};

const AllAdminRoutes = () => {
  const userRole = useSelector((state) => state.auth.userRole);
  const isAdmin = userRole?.toLowerCase() === "admin";
  
  return (
    <Routes>
      {/* Redirect based on role */}
      <Route 
        path="/" 
        element={<Navigate to={isAdmin ? "dashboard" : "orders"} replace />} 
      />
      
      {/* Admin-only routes */}
      <Route path="dashboard" element={<AdminOnly><Dashboard /></AdminOnly>} />
      <Route path="products" element={<AdminOnly><Products/></AdminOnly>} />
      <Route path="products/:id" element={<AdminOnly><ProductDetail /></AdminOnly>} />
      <Route path="brands" element={<AdminOnly><Brands/></AdminOnly>} />
      <Route path="categories" element={<AdminOnly><Categories/></AdminOnly>} />
      <Route path="customers" element={<AdminOnly><Customers/></AdminOnly>} />
      <Route path="staff" element={<AdminOnly><Staff/></AdminOnly>} />
      <Route path="promotions" element={<AdminOnly><Promotions/></AdminOnly>} />
      <Route path="promotions/:promotionId" element={<AdminOnly><PromotionDetail/></AdminOnly>} />
      <Route path="warranty-claims" element={<AdminOnly><WarrantyClaims/></AdminOnly>} />
      
      {/* Routes accessible by both Admin and Staff */}
      <Route path="orders" element={<Order/>}/>
      <Route path="blog" element={<Blog/>}/>
      <Route path="settings" element={<Settings/>}/>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AllAdminRoutes;