// src/pages/Employee/useEmployeeData.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import type { IEmployee } from '../../types/employee'
import { getEmployeesApi } from '../../api/employee'

export interface EmployeeFilters {
    realName: string
    phone: string
}

export interface UseEmployeeDataReturn {
    list: IEmployee[]
    total: number
    page: number
    pageSize: number
    loading: boolean
    error: string
    filters: EmployeeFilters
    setPage: (page: number) => void
    setPageSize: (pageSize: number) => void
    setFilters: (filters: EmployeeFilters) => void
    setList: (list: IEmployee[]) => void
    setTotal: (total: number) => void
    setLoading: (loading: boolean) => void
    setError: (error: string) => void
    fetchData: () => Promise<void>
    handlePageSizeChange: (val: number) => void
    handleReset: () => void
}

export function useEmployeeData(): UseEmployeeDataReturn {
    const [list, setList] = useState<IEmployee[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // 搜索条件
    const [filters, setFilters] = useState<EmployeeFilters>({
        realName: '',
        phone: '',
    })
    const requestIdRef = useRef(0)

    const fetchData = useCallback(async () => {
        const thisRequest = ++requestIdRef.current
        setLoading(true)
        setError('')
        try {
            const res = await getEmployeesApi({
                page,
                pageSize,
                realName: filters.realName || undefined,
                phone: filters.phone || undefined,
            })
            if (thisRequest === requestIdRef.current) {
                const { list, total } = res.data as { list: IEmployee[]; total: number }
                setList(list)
                setTotal(total)
            }
        } catch (err: unknown) {
            if (thisRequest === requestIdRef.current) {
                setError('获取员工列表失败')
            }
        } finally {
            if (thisRequest === requestIdRef.current) {
                setLoading(false)
            }
        }
    }, [page, pageSize, filters.realName, filters.phone])

    // 组件挂载时自动获取数据
    useEffect(() => {
        fetchData()
        // requestIdRef handles race condition cancellation
    }, [fetchData])

    const handlePageSizeChange = (val: number) => {
        setPageSize(val)
        setPage(1)
    }

    const handleReset = () => {
        setFilters({ realName: '', phone: '' })
        setPage(1)
    }

    return {
        list,
        total,
        page,
        pageSize,
        loading,
        error,
        filters,
        setPage,
        setPageSize,
        setFilters,
        setList,
        setTotal,
        setLoading,
        setError,
        fetchData,
        handlePageSizeChange,
        handleReset,
    }
}
