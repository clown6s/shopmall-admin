// src/pages/ABAC/useABACPolicyData.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { ABACPolicy } from '../../types/abac'
import { getABACPoliciesApi } from '../../api/abac'

export interface UseABACPolicyDataReturn {
    list: ABACPolicy[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function useABACPolicyData(): UseABACPolicyDataReturn {
    const [list, setList] = useState<ABACPolicy[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await getABACPoliciesApi()
            if (thisRequest === requestIdRef.current) {
                setList(res.data as ABACPolicy[])
            }
        } catch {
            if (thisRequest === requestIdRef.current) {
                setError('获取策略列表失败')
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
