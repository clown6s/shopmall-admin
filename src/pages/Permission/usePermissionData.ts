// src/pages/Permission/usePermissionData.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { IPermission } from '../../types/permission'
import { getPermissionsApi } from '../../api/permission'

export interface UsePermissionDataReturn {
    list: IPermission[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function usePermissionData(): UsePermissionDataReturn {
    const [list, setList] = useState<IPermission[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await getPermissionsApi()
            if (thisRequest === requestIdRef.current) {
                setList(res.data as IPermission[])
            }
        } catch {
            if (thisRequest === requestIdRef.current) {
                setError('获取权限列表失败')
            }
        } finally {
            if (thisRequest === requestIdRef.current) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { list, loading, error, fetchData }
}
