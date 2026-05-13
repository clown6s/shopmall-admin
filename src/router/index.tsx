// src/router/index.tsx
import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import { CircularProgress } from '@mui/material'

// 简单的加载组件
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh' 
  }}>
    <CircularProgress />
  </div>
)

// 使用 React.lazy 实现懒加载
const Layout = React.lazy(() => import('../layout/Layout'))
const Login = React.lazy(() => import('../pages/Login'))
const Dashboard = React.lazy(() => import('../pages/Dashboard'))
const Product = React.lazy(() => import('../pages/Product'))
const ProductCategory = React.lazy(() => import('../pages/ProductCategory'))
const Employee = React.lazy(() => import('../pages/Employee'))
const Department = React.lazy(() => import('../pages/Department'))
const ABACPolicy = React.lazy(() => import('../pages/ABAC'))
const Role = React.lazy(() => import('../pages/Role'))
const Permission = React.lazy(() => import('../pages/Permission'))

const router = createBrowserRouter([
  {
        path: '/login',
        element: (
            <React.Suspense fallback={<Loading />}>
                <Login />
            </React.Suspense>
        ),
    },
  {
        element: <RequireAuth />,
        children: [
            {
                path: '/',
                element: (
                    <React.Suspense fallback={<Loading />}>
                        <Layout />
                    </React.Suspense>
                ),
                children: [
                    {
                        index: true,
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Dashboard />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'product',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Product />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'product/category',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <ProductCategory />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'system/employee',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Employee />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'system/department',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Department />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'system/abac',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <ABACPolicy />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'system/role',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Role />
                            </React.Suspense>
                        ),
                    },
                    {
                        path: 'system/permission',
                        element: (
                            <React.Suspense fallback={<Loading />}>
                                <Permission />
                            </React.Suspense>
                        ),
                    },
                ],
            },
        ],
    },
])

export default router
