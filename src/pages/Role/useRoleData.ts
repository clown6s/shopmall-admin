// src/pages/Role/useRoleData.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { IRole } from '../../types/role'
import { getRolesApi } from '../../api/role'

export interface UseRoleDataReturn {
    list: IRole[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function useRoleData(): UseRoleDataReturn {
    const [list, setList] = useState<IRole[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await getRolesApi()
            if (thisRequest === requestIdRef.current) {
                setList(res.data as IRole[])
            }
        } catch {
            if (thisRequest === requestIdRef.current) {
                setError('获取角色列表失败')
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
