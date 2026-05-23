// src/store/useUserStore.ts
import { create } from "zustand";

export interface UserInfo {
    employeeId: string  // 后端 BIGINT，通过 json-bigint 转为 string
    realName: string
    avatar: string
    phone: string
    role: string
    gender: number
    department: string
    position: string
}

// ── 认证缓存（放在这里避免循环依赖） ──
const CACHE_TTL = 5_000
let lastValidTime = 0
let cachedResult: boolean | null = null

export function invalidateAuthCache() {
    lastValidTime = 0
    cachedResult = null
}

export function getAuthCache() {
    return { cachedResult, lastValidTime, CACHE_TTL }
}

export function setAuthCacheSuccess() {
    cachedResult = true
    lastValidTime = Date.now()
}

// ── Store ──
interface UserState {
    userInfo: UserInfo | null
    menuPaths: string[]
    permissions: string[]
    permissionSet: Set<string>
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
    permissionSet: new Set<string>(),

    setUserInfo: (userInfo) => {
        set({ userInfo })
    },

    fetchUserInfo: async () => {
        try {
            const request = (await import('../api/request')).default
            const [userRes, menusRes] = await Promise.all([
                request.get<UserInfo>('/user/me'),
                request.get<{ menus: string[]; permissions: string[] }>('/user/menus'),
            ])

            const userInfo = userRes.data
            const menusData = menusRes.data
            if (userInfo && typeof userInfo.employeeId === 'string') {
                const perms = menusData?.permissions || []
                set({
                    userInfo,
                    menuPaths: menusData?.menus || [],
                    permissions: perms,
                    permissionSet: new Set(perms),
                })
                return true
            }
            if (import.meta.env.DEV) {
                console.warn('[UserStore] 用户信息无效:', userInfo)
            }
            set({ userInfo: null, menuPaths: [], permissions: [], permissionSet: new Set<string>() })
            return false
        } catch (err) {
            if (import.meta.env.DEV) {
                console.error('[UserStore] fetchUserInfo 失败:', err)
            }
            set({ userInfo: null, menuPaths: [], permissions: [], permissionSet: new Set<string>() })
            return false
        }
    },

    fetchMenuPaths: async () => {
        try {
            const res = await (await import('../api/request')).default.get<{ menus: string[]; permissions: string[] }>('/user/menus')
            const data = res.data
            const perms = data?.permissions || []
            set({ menuPaths: data?.menus || [], permissions: perms, permissionSet: new Set(perms) })
        } catch {
            set({ menuPaths: [], permissions: [], permissionSet: new Set<string>() })
        }
    },

    hasPermission: (key: string) => {
        return get().permissionSet.has(key)
    },

    logout: async () => {
        if (useUserStore.getState().userInfo === null) {
            return;
        }
        try {
            const request = (await import('../api/request')).default
            await request.post('/auth/logout')
        } catch {
            // logout 失败不阻塞前端状态清理
        }
        set({ userInfo: null, menuPaths: [], permissions: [], permissionSet: new Set<string>() });
        invalidateAuthCache();
        window.location.href = '/login';
    },
}))

export default useUserStore
