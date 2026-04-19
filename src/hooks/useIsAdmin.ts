// hooks/useIsAdmin.ts
import useUserStore from '../store/useUserStore'

export const useIsAdmin = () => {
    const role = useUserStore((s) => s.userInfo?.role)
    return role === '管理员'
}
