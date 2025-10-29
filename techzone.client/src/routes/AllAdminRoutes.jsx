import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";
import Products from "@/pages/Admin/Products";
import Customers from "@/pages/Admin/Customer/Customer";

const AllAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />

            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AllAdminRoutes;
