// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout/Layout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Product from '../pages/Product'
import Users from '../pages/Users'
import Role from '../pages/Role'
import Menu from '../pages/Menu'
import Permission from '../pages/Permission'
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
                    { path: 'users', element: <Users /> },
                    { path: 'system/role', element: <Role /> },
                    { path: 'system/menu', element: <Menu /> },
                    { path: 'system/permission', element: <Permission /> },
                ],
            },
        ],
    },
])

export default router
