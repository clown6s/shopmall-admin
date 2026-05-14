// src/pages/Role/useRoleData.ts
import type { IRole } from '../../types/role'
import { getRolesApi } from '../../api/role'
import { useSimpleListData } from '../../hooks/useSimpleListData'

export interface UseRoleDataReturn {
    list: IRole[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function useRoleData(): UseRoleDataReturn {
    return useSimpleListData(getRolesApi, '获取角色列表失败')
}
