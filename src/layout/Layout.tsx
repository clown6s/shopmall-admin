// src/layout/Layout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Avatar,
    Tooltip,
    Divider,
    IconButton,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SettingsIcon from '@mui/icons-material/Settings'
import BadgeIcon from '@mui/icons-material/Badge'
import CategoryIcon from '@mui/icons-material/Category'
import GroupsIcon from '@mui/icons-material/Groups'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import SecurityIcon from '@mui/icons-material/Security'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import KeyIcon from '@mui/icons-material/Key'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import useUserStore from '../store/useUserStore'
import type { JSX } from 'react'
import React, { useState, type ComponentType } from 'react'
import type { SvgIconProps } from '@mui/material/SvgIcon'

const DRAWER_WIDTH = 260
const DRAWER_COLLAPSED_WIDTH = 72

interface NavItem {
    label: string
    path: string
    icon: ComponentType<SvgIconProps>
    color: string
}

const navItems: NavItem[] = [
    { label: '仪表盘', path: '/', icon: DashboardIcon, color: '#6366f1' },
]

const productMenuItems: NavItem[] = [
    { label: '商品列表', path: '/product', icon: StorefrontIcon, color: '#0ea5e9' },
    { label: '商品分类', path: '/product/category', icon: CategoryIcon, color: '#06b6d4' },
]

const systemMenuItems: NavItem[] = [
    { label: '员工管理', path: '/system/employee', icon: BadgeIcon, color: '#6366f1' },
    { label: '部门管理', path: '/system/department', icon: GroupsIcon, color: '#10b981' },
    { label: '角色管理', path: '/system/role', icon: AdminPanelSettingsIcon, color: '#8b5cf6' },
    { label: '权限管理', path: '/system/permission', icon: KeyIcon, color: '#ec4899' },
    { label: '策略管理', path: '/system/abac', icon: SecurityIcon, color: '#f59e0b' },
]

export default function Layout(): JSX.Element {
    const logout = useUserStore((state) => state.logout)
    const userInfo = useUserStore((state) => state.userInfo)
    const menuPaths = useUserStore((state) => state.menuPaths)
    const location = useLocation()
    const [systemMenuOpen, setSystemMenuOpen] = useState(false)
    const [productMenuOpen, setProductMenuOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    // 根据后端返回的菜单权限过滤侧边栏
    const filteredSystemMenuItems = systemMenuItems.filter(
        (item) => menuPaths.length === 0 || menuPaths.includes(item.path)
    )
    const filteredProductMenuItems = productMenuItems.filter(
        (item) => menuPaths.length === 0 || menuPaths.includes(item.path)
    )

    const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH

    const handleLogout = () => {
        logout()
    }

    const isSystemMenuActive = filteredSystemMenuItems.some((item) =>
        location.pathname.startsWith(item.path)
    )

    const isProductMenuActive = filteredProductMenuItems.some((item) =>
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    )

    // 系统管理菜单如果没有可见子项则整个隐藏
    const showSystemMenu = filteredSystemMenuItems.length > 0

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100vw' }}>
            {/* ── AppBar ── */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: '#fff',
                    boxShadow: 'none',
                    borderBottom: 'none',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: 'linear-gradient(90deg, transparent 0%, #c7d2fe 30%, #6366f1 50%, #c7d2fe 70%, transparent 100%)',
                        opacity: 0.35,
                    },
                }}
            >
                <Toolbar sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                            }}
                        >
                            <StorefrontIcon sx={{ fontSize: 18, color: '#fff' }} />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: '#1e293b',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            ShopMall
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative', zIndex: 9999 }}>
                        <IconButton
                            onClick={() => setCollapsed(!collapsed)}
                            size="small"
                            title={collapsed ? '展开侧栏' : '收起侧栏'}
                            sx={{
                                color: '#64748b',
                                borderRadius: '10px',
                                '&:hover': { background: '#f1f5f9' },
                            }}
                        >
                            {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
                        </IconButton>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{
                                color: '#64748b',
                                textTransform: 'none',
                                borderRadius: '10px',
                                px: 2,
                                '&:hover': {
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                },
                            }}
                        >
                            退出
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── Sidebar (Light) ── */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    transition: 'width 0.25s ease',
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        mt: '64px',
                        height: 'calc(100vh - 64px)',
                        background: '#fafbff',
                        borderRight: '1px solid #e8ecf4',
                        overflow: 'hidden',
                        transition: 'width 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* Scrollable nav area */}
                <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2 }}>
                    {/* Main Navigation */}
                    <List sx={{ px: collapsed ? 1 : 2 }}>
                        {!collapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 2, py: 1, display: 'block',
                                    color: '#94a3b8', fontWeight: 600,
                                    fontSize: '0.68rem', letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                概览
                            </Typography>
                        )}
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={isActive}
                                        sx={{
                                            borderRadius: '10px',
                                            mb: 0.5,
                                            py: 1.1,
                                            px: collapsed ? 0 : 2,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            '&.Mui-selected': {
                                                background: `${item.color}0d`,
                                                '&:hover': { background: `${item.color}14` },
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 3,
                                                    height: '60%',
                                                    borderRadius: '0 3px 3px 0',
                                                    background: `linear-gradient(180deg, ${item.color}, ${item.color}88)`,
                                                },
                                            },
                                            '&:hover': { background: '#f1f5f9' },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: collapsed ? 'unset' : 40,
                                                color: isActive ? item.color : '#64748b',
                                                transition: 'all 0.2s ease',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {React.createElement(item.icon)}
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText
                                                primary={item.label}
                                                slotProps={{
                                                    primary: {
                                                        sx: {
                                                            fontWeight: isActive ? 600 : 500,
                                                            color: isActive ? '#1e293b' : '#64748b',
                                                            fontSize: '0.875rem',
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            )
                        })}
                    </List>

                    {/* Product Management */}
                    <List sx={{ px: collapsed ? 1 : 2 }}>
                        <Tooltip title={collapsed ? '商品管理' : ''} placement="right">
                            <ListItemButton
                                onClick={() => !collapsed && setProductMenuOpen(!productMenuOpen)}
                                selected={isProductMenuActive}
                                aria-expanded={productMenuOpen || isProductMenuActive}
                                sx={{
                                    borderRadius: '10px',
                                    mb: 0.5,
                                    py: 1.1,
                                    px: collapsed ? 0 : 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&.Mui-selected': {
                                        background: '#0ea5e90d',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: '60%',
                                            borderRadius: '0 3px 3px 0',
                                            background: 'linear-gradient(180deg, #0ea5e9, #06b6d488)',
                                        },
                                    },
                                    '&:hover': { background: '#f1f5f9' },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 'unset' : 40,
                                        color: isProductMenuActive ? '#0ea5e9' : '#64748b',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <StorefrontIcon />
                                </ListItemIcon>
                                {!collapsed && (
                                    <>
                                        <ListItemText
                                            primary="商品管理"
                                            slotProps={{
                                                primary: {
                                                    sx: {
                                                        fontWeight: isProductMenuActive ? 600 : 500,
                                                        color: isProductMenuActive ? '#1e293b' : '#64748b',
                                                        fontSize: '0.875rem',
                                                    }
                                                }
                                            }}
                                        />
                                        {productMenuOpen || isProductMenuActive
                                            ? <ExpandLess sx={{ color: '#94a3b8', fontSize: 18 }} />
                                            : <ExpandMore sx={{ color: '#94a3b8', fontSize: 18 }} />
                                        }
                                    </>
                                )}
                            </ListItemButton>
                        </Tooltip>
                        {!collapsed && (
                            <Collapse in={productMenuOpen || isProductMenuActive} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {filteredProductMenuItems.map((item) => {
                                        const isActive = location.pathname === item.path
                                        return (
                                            <ListItemButton
                                                key={item.path}
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    pl: 5.5, py: 0.9,
                                                    borderRadius: '8px', mb: 0.25,
                                                    transition: 'all 0.2s ease',
                                                    '&.Mui-selected': { background: `${item.color}0d` },
                                                    '&:hover': { background: '#f1f5f9' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32, color: isActive ? item.color : '#94a3b8' }}>
                                                    {React.createElement(item.icon)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.label}
                                                    slotProps={{
                                                        primary: {
                                                            sx: {
                                                                fontWeight: isActive ? 600 : 400,
                                                                color: isActive ? '#1e293b' : '#64748b',
                                                                fontSize: '0.82rem',
                                                            }
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        )
                                    })}
                                </List>
                            </Collapse>
                        )}
                        {collapsed && (
                            <List component="div" disablePadding>
                                {filteredProductMenuItems.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Tooltip key={item.path} title={item.label} placement="right">
                                            <ListItemButton
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    borderRadius: '8px', mb: 0.25, py: 0.9,
                                                    justifyContent: 'center',
                                                    '&.Mui-selected': { background: `${item.color}0d` },
                                                    '&:hover': { background: '#f1f5f9' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 'unset', color: isActive ? item.color : '#94a3b8', justifyContent: 'center' }}>
                                                    {React.createElement(item.icon)}
                                                </ListItemIcon>
                                            </ListItemButton>
                                        </Tooltip>
                                    )
                                })}
                            </List>
                        )}
                    </List>

                    <Divider sx={{ my: 2, mx: collapsed ? 1.5 : 2.5, borderColor: '#e8ecf4' }} />

                    {/* System Management */}
                    {showSystemMenu && (
                    <List sx={{ px: collapsed ? 1 : 2 }}>
                        {!collapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 2, py: 1, display: 'block',
                                    color: '#94a3b8', fontWeight: 600,
                                    fontSize: '0.68rem', letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                系统
                            </Typography>
                        )}
                        <Tooltip title={collapsed ? '系统管理' : ''} placement="right">
                            <ListItemButton
                                onClick={() => !collapsed && setSystemMenuOpen(!systemMenuOpen)}
                                selected={isSystemMenuActive}
                                aria-expanded={systemMenuOpen || isSystemMenuActive}
                                sx={{
                                    borderRadius: '10px',
                                    mb: 0.5, py: 1.1,
                                    px: collapsed ? 0 : 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&.Mui-selected': {
                                        background: '#6366f10d',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: '60%',
                                            borderRadius: '0 3px 3px 0',
                                            background: 'linear-gradient(180deg, #6366f1, #818cf888)',
                                        },
                                    },
                                    '&:hover': { background: '#f1f5f9' },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 'unset' : 40,
                                        color: isSystemMenuActive ? '#6366f1' : '#64748b',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SettingsIcon />
                                </ListItemIcon>
                                {!collapsed && (
                                    <>
                                        <ListItemText
                                            primary="系统管理"
                                            slotProps={{
                                                primary: {
                                                    sx: {
                                                        fontWeight: isSystemMenuActive ? 600 : 500,
                                                        color: isSystemMenuActive ? '#1e293b' : '#64748b',
                                                        fontSize: '0.875rem',
                                                    }
                                                }
                                            }}
                                        />
                                        {systemMenuOpen || isSystemMenuActive
                                            ? <ExpandLess sx={{ color: '#94a3b8', fontSize: 18 }} />
                                            : <ExpandMore sx={{ color: '#94a3b8', fontSize: 18 }} />
                                        }
                                    </>
                                )}
                            </ListItemButton>
                        </Tooltip>
                        {!collapsed && (
                            <Collapse in={systemMenuOpen || isSystemMenuActive} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {filteredSystemMenuItems.map((item) => {
                                        const isActive = location.pathname === item.path
                                        return (
                                            <ListItemButton
                                                key={item.path}
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    pl: 5.5, py: 0.9,
                                                    borderRadius: '8px', mb: 0.25,
                                                    transition: 'all 0.2s ease',
                                                    '&.Mui-selected': { background: `${item.color}0d` },
                                                    '&:hover': { background: '#f1f5f9' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32, color: isActive ? item.color : '#94a3b8' }}>
                                                    {React.createElement(item.icon)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.label}
                                                    slotProps={{
                                                        primary: {
                                                            sx: {
                                                                fontWeight: isActive ? 600 : 400,
                                                                color: isActive ? '#1e293b' : '#64748b',
                                                                fontSize: '0.82rem',
                                                            }
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        )
                                    })}
                                </List>
                            </Collapse>
                        )}
                        {collapsed && (
                            <List component="div" disablePadding>
                                {filteredSystemMenuItems.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Tooltip key={item.path} title={item.label} placement="right">
                                            <ListItemButton
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    borderRadius: '8px', mb: 0.25, py: 0.9,
                                                    justifyContent: 'center',
                                                    '&.Mui-selected': { background: `${item.color}0d` },
                                                    '&:hover': { background: '#f1f5f9' },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 'unset', color: isActive ? item.color : '#94a3b8', justifyContent: 'center' }}>
                                                    {React.createElement(item.icon)}
                                                </ListItemIcon>
                                            </ListItemButton>
                                        </Tooltip>
                                    )
                                })}
                            </List>
                        )}
                    </List>
                    )}
                </Box>
                {!collapsed && (
                    <Box sx={{ p: 2, borderTop: '1px solid #e8ecf4' }}>
                        <Box
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                borderRadius: '12px',
                                background: '#fff',
                                border: '1px solid #e8ecf4',
                            }}
                        >
                            {userInfo?.avatar ? (
                                <Avatar src={userInfo.avatar} sx={{ width: 36, height: 36, fontWeight: 600, fontSize: '0.85rem' }}>
                                    {userInfo.realName?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', fontWeight: 600, fontSize: '0.85rem' }}>
                                    {userInfo?.realName?.charAt(0)?.toUpperCase() ?? '?'}
                                </Avatar>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                    {userInfo?.realName ?? '未知用户'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', fontSize: '0.72rem' }}>
                                    {userInfo?.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
                {collapsed && (
                    <Box sx={{ p: 1.5, borderTop: '1px solid #e8ecf4', display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={userInfo?.realName ?? '未知用户'} placement="right">
                            {userInfo?.avatar ? (
                                <Avatar src={userInfo.avatar} sx={{ width: 34, height: 34, fontWeight: 600, fontSize: '0.85rem', cursor: 'default' }}>
                                    {userInfo.realName?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <Avatar sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', fontWeight: 600, fontSize: '0.85rem', cursor: 'default' }}>
                                    {userInfo?.realName?.charAt(0)?.toUpperCase() ?? '?'}
                                </Avatar>
                            )}
                        </Tooltip>
                    </Box>
                )}
            </Drawer>

            {/* ── Main Content ── */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: '64px',
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    background: '#f8fafc',
                    transition: 'margin-left 0.25s ease',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
