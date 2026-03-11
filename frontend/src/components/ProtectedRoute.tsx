import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user_role'); // เก็บ role ไว้ตอน login สำเร็จ

  // 1. ถ้ายังไม่ได้ Login ให้เด้งไปหน้า Login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ถ้า Login แล้ว แต่สิทธิ์ (Role) ไม่ถึง ให้เด้งไปหน้า Dashboard ที่ควรจะเป็น
  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    let defaultPath = '/operator/dashboard';
    if (userRole === 'admin') defaultPath = '/admin/dashboard';
    else if (userRole === 'researcher') defaultPath = '/researcher-dashboard';

    return <Navigate to={defaultPath} replace />;
  }

  return children as React.ReactElement;
};

export default ProtectedRoute;