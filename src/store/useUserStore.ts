// src/store/useUserStore.ts
// 已移除 localStorage 存储 token
// 用户信息与 token 改由 httpOnly cookie 管理（后端配合）
// 前端仅保留 userInfo 的内存状态

import { create } from "zustand";
import { invalidateAuthCache } from "../router/RequireAuth";

interface UserInfo {
    id: number
    realName: string
    avatar: string
    phone: string
    role: string
    gender: number
    department: string
    position: string
}

interface UserState {
    userInfo: UserInfo | null
    menuPaths: string[]
    permissions: string[]
    setUserInfo: (user: UserInfo) => void
    fetchUserInfo: () => Promise<boolean>
    fetchMenuPaths: () => Promise<void>
    hasPermission: (key: string) => boolean
    logout: () => void
}

const useUserStore = create<UserState>((set, get) => ({
    userInfo: null,
    menuPaths: [],
    permissions: [],

    setUserInfo: (userInfo) => {
        set({ userInfo })
    },

    // 从后端 /user/me 获取当前用户信息（用于路由守卫验证）
    // 注意：request.ts 的响应拦截器已自动解包 { code, data } 格式
    // 当 code === 200 时 res.data 已经是内层 data（即 UserInfo），不再有 code 字段
    fetchUserInfo: async () => {
        try {
            const request = (await import('../api/request')).default
            const [userRes, menusRes] = await Promise.all([
                request.get<UserInfo>('/user/me'),
                request.get<{ menus: string[]; permissions: string[] }>('/user/menus'),
            ])
            const userInfo = userRes.data
            const menusData = menusRes.data
            if (userInfo && typeof userInfo.id === 'number') {
                set({
                    userInfo,
                    menuPaths: menusData?.menus || [],
                    permissions: menusData?.permissions || [],
                })
                return true
            }
            set({ userInfo: null, menuPaths: [], permissions: [] })
            return false
        } catch {
            set({ userInfo: null, menuPaths: [], permissions: [] })
            return false
        }
    },

    // 从后端 /user/menus 获取当前用户的菜单权限路径 + 按钮权限keys
    fetchMenuPaths: async () => {
        try {
            const res = await (await import('../api/request')).default.get<{ menus: string[]; permissions: string[] }>('/user/menus')
            const data = res.data
            set({ menuPaths: data?.menus || [], permissions: data?.permissions || [] })
        } catch {
            set({ menuPaths: [], permissions: [] })
        }
    },

    hasPermission: (key: string) => {
        return get().permissions.includes(key)
    },

    logout: () => {
        console.log('[LOGOUT] logout() called, userInfo:', useUserStore.getState().userInfo);
        // 如果已登出，不再重复执行
        if (useUserStore.getState().userInfo === null) {
            console.log('[LOGOUT] userInfo is null, skip');
            return;
        }
        console.log('[LOGOUT] clearing userInfo...');
        set({ userInfo: null, menuPaths: [], permissions: [] });
        invalidateAuthCache();
        console.log('[LOGOUT] redirecting to /login...');
        // 直接跳转登录页，不等待后端退出接口
        window.location.href = '/login';
        console.log('[LOGOUT] window.location.href set done');
    },
}))

export default useUserStore
