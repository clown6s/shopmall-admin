// src/hooks/useSimpleListData.ts
import { useState, useCallback, useEffect, useRef } from 'react'

export function useSimpleListData<T>(
    fetchFn: () => Promise<{ data: T[] }>,
    errorMsg = '获取数据失败',
) {
    const [list, setList] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await fetchFn()
            if (thisRequest === requestIdRef.current) {
                setList(res.data)
            }
        } catch {
            if (thisRequest === requestIdRef.current) setError(errorMsg)
        } finally {
            if (thisRequest === requestIdRef.current) setLoading(false)
        }
    }, [fetchFn, errorMsg])

    useEffect(() => {
        fetchData()
        // requestIdRef handles race condition cancellation
    }, [fetchData])

    return { list, loading, error, fetchData }
}
