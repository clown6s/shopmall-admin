// src/router/index.tsx
import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import useUserStore from '../store/useUserStore'
import Layout from '../layout/Layout'

// 超级简单的加载组件 - 纯HTML，不依赖MUI
const Loading = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <span style={{ color: '#6366f1', fontSize: 14 }}>Loading...</span>
    </div>
)

const Login = React.lazy(() => import('../pages/Login'))
const Dashboard = React.lazy(() => import('../pages/Dashboard'))
const Product = React.lazy(() => import('../pages/Product'))
const ProductCategory = React.lazy(() => import('../pages/ProductCategory'))
const Employee = React.lazy(() => import('../pages/Employee'))
const Department = React.lazy(() => import('../pages/Department'))
const Role = React.lazy(() => import('../pages/Role'))
const Permission = React.lazy(() => import('../pages/Permission'))
const NotFound = React.lazy(() => import('../pages/NotFound'))

function LoginWithRedirect() {
    const userInfo = useUserStore((s) => s.userInfo)
    if (userInfo) {
        return <Navigate to="/" replace />
    }
    return (
        <React.Suspense fallback={<Loading />}>
            <Login />
        </React.Suspense>
    )
}

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginWithRedirect />,
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: '/',
                element: <Layout />,
                children: [
                    { index: true, element: <React.Suspense fallback={<Loading />}><Dashboard /></React.Suspense> },
                    { path: 'product', element: <React.Suspense fallback={<Loading />}><Product /></React.Suspense> },
                    { path: 'product/category', element: <React.Suspense fallback={<Loading />}><ProductCategory /></React.Suspense> },
                    { path: 'system/employee', element: <React.Suspense fallback={<Loading />}><Employee /></React.Suspense> },
                    { path: 'system/department', element: <React.Suspense fallback={<Loading />}><Department /></React.Suspense> },
                    { path: 'system/role', element: <React.Suspense fallback={<Loading />}><Role /></React.Suspense> },
                    { path: 'system/permission', element: <React.Suspense fallback={<Loading />}><Permission /></React.Suspense> },
                ],
            },
        ],
    },
    {
        path: '*',
        element: <React.Suspense fallback={<Loading />}><NotFound /></React.Suspense>,
    },
])

export default router
