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
    { label: '仪表盘', path: '/', icon: DashboardIcon, color: '#667eea' },
]

const productMenuItems: NavItem[] = [
    { label: '商品列表', path: '/product', icon: StorefrontIcon, color: '#4facfe' },
    { label: '商品分类', path: '/product/category', icon: CategoryIcon, color: '#00f2fe' },
]

const systemMenuItems: NavItem[] = [
    { label: '员工管理', path: '/system/employee', icon: BadgeIcon, color: '#38bdf8' },
    { label: '部门管理', path: '/system/department', icon: GroupsIcon, color: '#34d399' },
]

export default function Layout(): JSX.Element {
    const logout = useUserStore((state) => state.logout)
    const userInfo = useUserStore((state) => state.userInfo)
    const location = useLocation()
    const [systemMenuOpen, setSystemMenuOpen] = useState(false)
    const [productMenuOpen, setProductMenuOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH

    const handleLogout = () => {
        logout() // logout() 内部已做 window.location.href = '/login'，无需额外 navigate
    }

    const isSystemMenuActive = systemMenuItems.some((item) =>
        location.pathname.startsWith(item.path)
    )

    const isProductMenuActive = productMenuItems.some((item) =>
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    )

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', width: '100vw' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: '#fff',
                    borderBottom: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
            >
                <Toolbar sx={{ px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <StorefrontIcon sx={{ fontSize: 20, color: '#fff' }} />
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            ShopMall Admin
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* 折叠按钮 */}
                        <Tooltip title={collapsed ? '展开侧栏' : '收起侧栏'}>
                            <IconButton
                                onClick={() => setCollapsed(!collapsed)}
                                size="small"
                                sx={{
                                    color: '#64748b',
                                    borderRadius: '10px',
                                    '&:hover': { background: '#f1f5f9' },
                                }}
                            >
                                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="退出登录">
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
                                        background: '#f1f5f9',
                                        color: '#ef4444',
                                    },
                                }}
                            >
                                退出
                            </Button>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
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
                        background: '#fff',
                        borderRight: '1px solid #e2e8f0',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                        overflow: 'hidden',
                        transition: 'width 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* 滚动区域 */}
                <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2 }}>
                    {/* Main Navigation */}
                    <List sx={{ px: collapsed ? 1 : 2 }}>
                        {!collapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 2, py: 1, display: 'block',
                                    color: '#94a3b8', fontWeight: 600,
                                    fontSize: '0.7rem', letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                主菜单
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
                                            borderRadius: '12px',
                                            mb: 0.5,
                                            py: 1.2,
                                            px: collapsed ? 1.5 : 2,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            transition: 'all 0.2s ease',
                                            '&.Mui-selected': {
                                                background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                                                '&:hover': { background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)` },
                                            },
                                            '&:hover': { background: '#f8fafc' },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: collapsed ? 'unset' : 40,
                                                color: isActive ? item.color : '#64748b',
                                                transition: 'color 0.2s ease',
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
                                                            fontSize: '0.9rem',
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                        {!collapsed && isActive && (
                                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: item.color }} />
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
                                    borderRadius: '12px',
                                    mb: 0.5,
                                    py: 1.2,
                                    px: collapsed ? 1.5 : 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    '&.Mui-selected': { background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe08 100%)' },
                                    '&:hover': { background: '#f8fafc' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 40, color: isProductMenuActive ? '#4facfe' : '#64748b', justifyContent: 'center' }}>
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
                                                        fontSize: '0.9rem',
                                                    }
                                                }
                                            }}
                                        />
                                        {productMenuOpen || isProductMenuActive
                                            ? <ExpandLess sx={{ color: '#64748b', fontSize: 20 }} />
                                            : <ExpandMore sx={{ color: '#64748b', fontSize: 20 }} />
                                        }
                                    </>
                                )}
                            </ListItemButton>
                        </Tooltip>
                        {!collapsed && (
                            <Collapse in={productMenuOpen || isProductMenuActive} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {productMenuItems.map((item) => {
                                        const isActive = location.pathname === item.path
                                        return (
                                            <ListItemButton
                                                key={item.path}
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    pl: 6, py: 1,
                                                    borderRadius: '10px', mb: 0.5,
                                                    transition: 'all 0.2s ease',
                                                    '&.Mui-selected': {
                                                        background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)`,
                                                        '&:hover': { background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}0c 100%)` },
                                                    },
                                                    '&:hover': { background: '#f8fafc' },
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
                                                                fontWeight: isActive ? 600 : 500,
                                                                color: isActive ? '#1e293b' : '#64748b',
                                                                fontSize: '0.85rem',
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
                        {/* 折叠时展示子项图标 */}
                        {collapsed && (
                            <List component="div" disablePadding>
                                {productMenuItems.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Tooltip key={item.path} title={item.label} placement="right">
                                            <ListItemButton
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    borderRadius: '10px', mb: 0.5, py: 1,
                                                    justifyContent: 'center',
                                                    '&.Mui-selected': { background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)` },
                                                    '&:hover': { background: '#f8fafc' },
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

                    <Divider sx={{ my: 2, mx: collapsed ? 1 : 3, borderColor: '#e2e8f0' }} />

                    {/* System Management */}
                    <List sx={{ px: collapsed ? 1 : 2 }}>
                        {!collapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 2, py: 1, display: 'block',
                                    color: '#94a3b8', fontWeight: 600,
                                    fontSize: '0.7rem', letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                系统管理
                            </Typography>
                        )}
                        <Tooltip title={collapsed ? '系统管理' : ''} placement="right">
                            <ListItemButton
                                onClick={() => !collapsed && setSystemMenuOpen(!systemMenuOpen)}
                                selected={isSystemMenuActive}
                                aria-expanded={systemMenuOpen || isSystemMenuActive}
                                sx={{
                                    borderRadius: '12px',
                                    mb: 0.5, py: 1.2,
                                    px: collapsed ? 1.5 : 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    '&.Mui-selected': { background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
                                    '&:hover': { background: '#f8fafc' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 40, color: isSystemMenuActive ? '#667eea' : '#64748b', justifyContent: 'center' }}>
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
                                                        fontSize: '0.9rem',
                                                    }
                                                }
                                            }}
                                        />
                                        {systemMenuOpen || isSystemMenuActive
                                            ? <ExpandLess sx={{ color: '#64748b', fontSize: 20 }} />
                                            : <ExpandMore sx={{ color: '#64748b', fontSize: 20 }} />
                                        }
                                    </>
                                )}
                            </ListItemButton>
                        </Tooltip>
                        {!collapsed && (
                            <Collapse in={systemMenuOpen || isSystemMenuActive} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {systemMenuItems.map((item) => {
                                        const isActive = location.pathname === item.path
                                        return (
                                            <ListItemButton
                                                key={item.path}
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    pl: 6, py: 1,
                                                    borderRadius: '10px', mb: 0.5,
                                                    transition: 'all 0.2s ease',
                                                    '&.Mui-selected': {
                                                        background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)`,
                                                        '&:hover': { background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}0c 100%)` },
                                                    },
                                                    '&:hover': { background: '#f8fafc' },
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
                                                                fontWeight: isActive ? 600 : 500,
                                                                color: isActive ? '#1e293b' : '#64748b',
                                                                fontSize: '0.85rem',
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
                        {/* 折叠时展示子项图标 */}
                        {collapsed && (
                            <List component="div" disablePadding>
                                {systemMenuItems.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Tooltip key={item.path} title={item.label} placement="right">
                                            <ListItemButton
                                                component={Link}
                                                to={item.path}
                                                selected={isActive}
                                                sx={{
                                                    borderRadius: '10px', mb: 0.5, py: 1,
                                                    justifyContent: 'center',
                                                    '&.Mui-selected': { background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)` },
                                                    '&:hover': { background: '#f8fafc' },
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
                </Box>

                {/* Sidebar Footer */}
                {!collapsed && (
                    <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
                        <Box
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 2, p: 2,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            {userInfo?.avatar ? (
                                <Avatar src={userInfo.avatar} sx={{ width: 40, height: 40, fontWeight: 600 }}>
                                    {userInfo.realName?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600 }}>
                                    {userInfo?.realName?.charAt(0)?.toUpperCase() ?? '?'}
                                </Avatar>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {userInfo?.realName ?? '未知用户'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {userInfo?.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
                {collapsed && (
                    <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={userInfo?.realName ?? '未知用户'} placement="right">
                            {userInfo?.avatar ? (
                                <Avatar src={userInfo.avatar} sx={{ width: 36, height: 36, fontWeight: 600, cursor: 'default' }}>
                                    {userInfo.realName?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600, cursor: 'default' }}>
                                    {userInfo?.realName?.charAt(0)?.toUpperCase() ?? '?'}
                                </Avatar>
                            )}
                        </Tooltip>
                    </Box>
                )}
            </Drawer>

            {/* Main Content */}
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
