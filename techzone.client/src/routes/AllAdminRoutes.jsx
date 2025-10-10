import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Admin/Dashboard";

const AllAdminRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    );
};

export default AllAdminRoutes;
