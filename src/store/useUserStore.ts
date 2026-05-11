// src/store/useUserStore.ts
// 已移除 localStorage 存储 token
// 用户信息与 token 改由 httpOnly cookie 管理（后端配合）
// 前端仅保留 userInfo 的内存状态

import { create } from "zustand";
import { logoutApi } from "../api/employee";
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
    setUserInfo: (user: UserInfo) => void
    fetchUserInfo: () => Promise<boolean>
    logout: () => void
}

const useUserStore = create<UserState>((set) => ({
    userInfo: null,

    setUserInfo: (userInfo) => {
        set({ userInfo })
    },

    // 从后端 /user/me 获取当前用户信息（用于路由守卫验证）
    // 注意：request.ts 的响应拦截器已自动解包 { code, data } 格式
    // 当 code === 200 时 res.data 已经是内层 data（即 UserInfo），不再有 code 字段
    fetchUserInfo: async () => {
        try {
            const res = await (await import('../api/request')).default.get<UserInfo>('/user/me')
            const userInfo = res.data
            if (userInfo && typeof userInfo.id === 'number') {
                set({ userInfo })
                return true
            }
            set({ userInfo: null })
            return false
        } catch {
            set({ userInfo: null })
            return false
        }
    },

    logout: () => {
        // 如果已登出，不再重复执行
        if (useUserStore.getState().userInfo === null) return;
        set({ userInfo: null });
        // 调用后端退出接口清除 httpOnly cookie
        ;(async () => {
            try {
                await logoutApi()
            } finally {
                invalidateAuthCache();
                window.location.href = '/login'
            }
        })()
    },
}))

export default useUserStore
