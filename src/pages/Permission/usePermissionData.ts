// src/pages/Permission/usePermissionData.ts
import type { IPermission } from '../../types/permission'
import { getPermissionsApi } from '../../api/permission'
import { useSimpleListData } from '../../hooks/useSimpleListData'

export interface UsePermissionDataReturn {
    list: IPermission[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function usePermissionData(): UsePermissionDataReturn {
    return useSimpleListData(getPermissionsApi, '获取权限列表失败')
}
