// src/store/useUserStore.ts
import { create } from "zustand";

interface UserState {
    token: string;
    setToken: (token: string) => void;
    logout: () => void;
}

const useUserStore = create<UserState>((set) => ({
    token: localStorage.getItem("token") || "",

    setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token });
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ token: "" });
    },
}));

export default useUserStore;