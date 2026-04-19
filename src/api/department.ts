// src/api/department.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type { IDepartment, CreateDepartmentForm } from '../types/department'

export const getDepartmentsApi = (params: {
    page: number
    pageSize: number
    deptName?: string
}) =>
    request.get<ApiResponse<{ list: IDepartment[]; total: number }>>('/department', { params })

export const getAllDepartmentsApi = () =>
    request.get<ApiResponse<IDepartment[]>>('/department/all')

export const getDepartmentApi = (id: number) =>
    request.get<ApiResponse<IDepartment>>(`/department/${id}`)

export const createDepartmentApi = (data: CreateDepartmentForm) =>
    request.post<ApiResponse<{ deptId: number }>>('/department', data)

export const updateDepartmentApi = (id: number, data: CreateDepartmentForm) =>
    request.put<ApiResponse<IDepartment>>(`/department/${id}`, data)

export const deleteDepartmentApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/department/${id}`)
