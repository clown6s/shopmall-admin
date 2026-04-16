// src/router/RequireAuth.tsx
import { Navigate, Outlet } from 'react-router-dom'

/** 动态守卫：每次路由渲染时实时读取 token */
export default function RequireAuth() {
    const token = localStorage.getItem('token')
    return token ? <Outlet /> : <Navigate to="/login" replace />
}
