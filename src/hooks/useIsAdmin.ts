// hooks/useIsAdmin.ts
import useUserStore from '../store/useUserStore'

/**
 * 管理员权限判断
 *
 * TODO(M-7): 当前仅依赖前端字符串匹配，存在以下风险：
 * 1. 后端 role 字段值变化（如改为 admin/ADMIN）将导致权限失效
 * 2. 前端权限可被 DevTools 篡改
 *
 * 建议改进：
 * - 后端 /user/me 接口返回明确的 isAdmin: boolean 字段
 * - 前端直接使用该字段：return userInfo?.isAdmin ?? false
 * - 关键操作（删除、编辑）必须由后端做权限校验（当前后端已有校验可忽略）
 */
export const useIsAdmin = () => {
    const role = useUserStore((s) => s.userInfo?.role)
    return role === 'admin'
}
