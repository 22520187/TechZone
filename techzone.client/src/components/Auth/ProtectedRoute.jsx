import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and user role
 * 
 * @param {ReactNode} children - The component to render if authorized
 * @param {Array<string>} allowedRoles - Array of roles allowed to access this route
 * @param {string} redirectTo - Path to redirect if not authorized (default: "/auth/login")
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/auth/login" 
}) => {
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated but not authorized (wrong role)
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return children;
};

export default ProtectedRoute;
