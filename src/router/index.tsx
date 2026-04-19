// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Product from '../pages/Product'
import ProductCategory from '../pages/ProductCategory'
import Employee from '../pages/Employee'
import RequireAuth from './RequireAuth'

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: '/',
                element: <Layout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'product', element: <Product /> },
                    { path: 'product/category', element: <ProductCategory /> },
                    { path: 'system/employee', element: <Employee /> },
                ],
            },
        ],
    },
])

export default router
