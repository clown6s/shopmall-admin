// src/api/department.ts
import request from './request'
import type { IDepartment, CreateDepartmentForm } from '../types/department'

export const getDepartmentsApi = (params: {
    page: number
    pageSize: number
    deptName?: string
}) =>
    request.get<{ list: IDepartment[]; total: number }>('/department', { params })

export const getAllDepartmentsApi = () =>
    request.get<IDepartment[]>('/department/all')

export const getDepartmentApi = (id: string) =>
    request.get<IDepartment>(`/department/${id}`)

export const createDepartmentApi = (data: CreateDepartmentForm) =>
    request.post<{ deptId: string }>('/department', data)

export const updateDepartmentApi = (id: string, data: CreateDepartmentForm) =>
    request.put<IDepartment>(`/department/${id}`, data)

export const deleteDepartmentApi = (id: string) =>
    request.delete<null>(`/department/${id}`)
