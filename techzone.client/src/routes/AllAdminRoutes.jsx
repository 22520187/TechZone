import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import Products from "@/pages/Admin/Products";
import Customers from "@/pages/Admin/Customer/Customer";
import Categories from "@/pages/Admin/Categories/Categories";
import Brands from "@/pages/Admin/Brands/Brands";
import Orders from "@/pages/Admin/Orders/Orders";
import OrderDetail from "@/pages/Admin/Orders/OrderDetail";
import Promotions from "@/pages/Admin/Promotions/Promotions";

const AllAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/promotions" element={<Promotions />} />

            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AllAdminRoutes;
