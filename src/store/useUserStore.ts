// src/store/useUserStore.ts
import { create } from "zustand";

interface UserInfo {
    employeeId: string
    realName: string
    avatar: string
    phone: string
    canLogin: number
}

interface UserState {
    token: string
    userInfo: UserInfo | null
    setToken: (token: string) => void
    setUserInfo: (user: UserInfo) => void
    logout: () => void
}

const storedUserInfo = (() => {
    try {
        const raw = localStorage.getItem("userInfo")
        return raw ? (JSON.parse(raw) as UserInfo) : null
    } catch {
        return null
    }
})()

const useUserStore = create<UserState>((set) => ({
    token: localStorage.getItem("token") || "",
    userInfo: storedUserInfo,

    setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token });
    },

    setUserInfo: (userInfo) => {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        set({ userInfo });
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        set({ token: "", userInfo: null });
    },
}));

export default useUserStore;
