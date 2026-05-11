// src/pages/Department/useDepartmentData.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { IDepartment } from '../../types/department'
import { getDepartmentsApi } from '../../api/department'

export interface UseDepartmentDataReturn {
    list: IDepartment[]
    total: number
    page: number
    pageSize: number
    search: string
    loading: boolean
    error: string
    setPage: (page: number) => void
    setPageSize: (pageSize: number) => void
    setSearch: (search: string) => void
    fetchData: () => Promise<void>
}

export function useDepartmentData(): UseDepartmentDataReturn {
    const [list, setList] = useState<IDepartment[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await getDepartmentsApi({ page, pageSize, deptName: search || undefined })
            if (thisRequest === requestIdRef.current) {
                const { list, total } = res.data as { list: IDepartment[]; total: number }
                setList(list)
                setTotal(total)
            }
        } catch (err: unknown) {
            if (thisRequest === requestIdRef.current) {
                setError('获取部门列表失败')
            }
        } finally {
            if (thisRequest === requestIdRef.current) {
                setLoading(false)
            }
        }
    }, [page, pageSize, search])

    // 搜索变化时重置页码并重新获取数据
    useEffect(() => {
        setPage(1)
    }, [search])

    // 页码、页大小或搜索条件变化时获取数据
    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        list,
        total,
        page,
        pageSize,
        search,
        loading,
        error,
        setPage,
        setPageSize,
        setSearch,
        fetchData,
    }
}
