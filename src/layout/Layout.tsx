// src/layout/Layout.tsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
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
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import CategoryIcon from '@mui/icons-material/Category'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import LogoutIcon from '@mui/icons-material/Logout'
import useUserStore from '../store/useUserStore'
import type { JSX } from 'react'
import { useState } from 'react'

const DRAWER_WIDTH = 260

const navItems = [
    { label: '仪表盘', path: '/', icon: <DashboardIcon />, color: '#667eea' },
    { label: '用户管理', path: '/users', icon: <PeopleIcon />, color: '#f093fb' },
]

const productMenuItems = [
    { label: '商品列表', path: '/product', icon: <StorefrontIcon />, color: '#4facfe' },
    { label: '商品分类', path: '/product/category', icon: <CategoryIcon />, color: '#00f2fe' },
]

const systemMenuItems = [
    { label: '角色管理', path: '/system/role', icon: <AssignmentIndIcon />, color: '#f5576c' },
    { label: '菜单管理', path: '/system/menu', icon: <MenuBookIcon />, color: '#43e97b' },
    { label: '权限管理', path: '/system/permission', icon: <SecurityIcon />, color: '#fa709a' },
]

export default function Layout(): JSX.Element {
    const logout = useUserStore((state) => state.logout)
    const navigate = useNavigate()
    const location = useLocation()
    const [systemMenuOpen, setSystemMenuOpen] = useState(false)
    const [productMenuOpen, setProductMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    const isSystemMenuActive = systemMenuItems.some((item) =>
        location.pathname.startsWith(item.path)
    )

    const isProductMenuActive = productMenuItems.some((item) =>
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        mt: '64px',
                        height: 'calc(100vh - 64px)',
                        background: '#fff',
                        borderRight: '1px solid #e2e8f0',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
                        overflowY: 'auto',
                    },
                }}
            >
                <Box sx={{ py: 2 }}>
                    {/* Main Navigation */}
                    <List sx={{ px: 2 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 2,
                                py: 1,
                                display: 'block',
                                color: '#94a3b8',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            主菜单
                        </Typography>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <ListItemButton
                                    key={item.path}
                                    component={Link}
                                    to={item.path}
                                    selected={isActive}
                                    sx={{
                                        borderRadius: '12px',
                                        mb: 0.5,
                                        py: 1.2,
                                        px: 2,
                                        transition: 'all 0.2s ease',
                                        '&.Mui-selected': {
                                            background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                                            },
                                        },
                                        '&:hover': {
                                            background: '#f8fafc',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isActive ? item.color : '#64748b',
                                            transition: 'color 0.2s ease',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
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
                                    {isActive && (
                                        <Box
                                            sx={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                background: item.color,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            )
                        })}
                    </List>

                    {/* Product Management */}
                    <List sx={{ px: 2 }}>
                        <ListItemButton
                            onClick={() => setProductMenuOpen(!productMenuOpen)}
                            selected={isProductMenuActive}
                            sx={{
                                borderRadius: '12px',
                                mb: 0.5,
                                py: 1.2,
                                px: 2,
                                transition: 'all 0.2s ease',
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe08 100%)',
                                },
                                '&:hover': { background: '#f8fafc' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isProductMenuActive ? '#4facfe' : '#64748b' }}>
                                <StorefrontIcon />
                            </ListItemIcon>
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
                            {productMenuOpen || isProductMenuActive ? (
                                <ExpandLess sx={{ color: '#64748b', fontSize: 20 }} />
                            ) : (
                                <ExpandMore sx={{ color: '#64748b', fontSize: 20 }} />
                            )}
                        </ListItemButton>
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
                                                pl: 6,
                                                py: 1,
                                                borderRadius: '10px',
                                                mb: 0.5,
                                                transition: 'all 0.2s ease',
                                                '&.Mui-selected': {
                                                    background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}0c 100%)`,
                                                    },
                                                },
                                                '&:hover': { background: '#f8fafc' },
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32, color: isActive ? item.color : '#94a3b8' }}>
                                                {item.icon}
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
                    </List>

                    <Divider sx={{ my: 2, mx: 3, borderColor: '#e2e8f0' }} />

                    {/* System Management */}
                    <List sx={{ px: 2 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 2,
                                py: 1,
                                display: 'block',
                                color: '#94a3b8',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                            }}
                        >
                            系统管理
                        </Typography>
                        <ListItemButton
                            onClick={() => setSystemMenuOpen(!systemMenuOpen)}
                            selected={isSystemMenuActive}
                            sx={{
                                borderRadius: '12px',
                                mb: 0.5,
                                py: 1.2,
                                px: 2,
                                transition: 'all 0.2s ease',
                                '&.Mui-selected': {
                                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                },
                                '&:hover': {
                                    background: '#f8fafc',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 40,
                                    color: isSystemMenuActive ? '#667eea' : '#64748b',
                                }}
                            >
                                <SettingsIcon />
                            </ListItemIcon>
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
                            {systemMenuOpen || isSystemMenuActive ? (
                                <ExpandLess sx={{ color: '#64748b', fontSize: 20 }} />
                            ) : (
                                <ExpandMore sx={{ color: '#64748b', fontSize: 20 }} />
                            )}
                        </ListItemButton>
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
                                                pl: 6,
                                                py: 1,
                                                borderRadius: '10px',
                                                mb: 0.5,
                                                transition: 'all 0.2s ease',
                                                '&.Mui-selected': {
                                                    background: `linear-gradient(135deg, ${item.color}12 0%, ${item.color}06 100%)`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${item.color}18 0%, ${item.color}0c 100%)`,
                                                    },
                                                },
                                                '&:hover': {
                                                    background: '#f8fafc',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 32,
                                                    color: isActive ? item.color : '#94a3b8',
                                                }}
                                            >
                                                {item.icon}
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
                    </List>
                </Box>

                {/* Sidebar Footer */}
                <Box
                    sx={{
                        mt: 'auto',
                        p: 3,
                        borderTop: '1px solid #e2e8f0',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 600,
                            }}
                        >
                            A
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: '#1e293b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            管理员
                        </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#64748b',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    display: 'block',
                                }}
                            >
                                admin@shopmall.com
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    mt: '64px',
                    height: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    background: '#f8fafc',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
