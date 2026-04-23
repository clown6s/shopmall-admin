// src/api/employee.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type { IEmployee, CreateEmployeeForm, LoginResp } from '../types/employee'

// 员工登录
export const loginApi = (phone: string, password: string) =>
    request.post<ApiResponse<LoginResp>>('/employee/login', { phone, password })

export const logoutApi = () =>
    request.post<ApiResponse<null>>('/employee/logout')

export const getProfileApi = () =>
    request.get<ApiResponse<IEmployee>>('/employee/profile')

export const getEmployeesApi = (params: {
    page: number
    pageSize: number
    realName?: string
    phone?: string
}) =>
    request.get<ApiResponse<{ list: IEmployee[]; total: number; page: number; pageSize: number }>>(
        '/employee/list',
        { params }
    )

export const getEmployeeApi = (id: number) =>
    request.get<ApiResponse<IEmployee>>(`/employee/${id}`)

export const createEmployeeApi = (data: CreateEmployeeForm) =>
    request.post<ApiResponse<IEmployee>>('/employee', data)

export const updateEmployeeApi = (id: number, data: CreateEmployeeForm) =>
    request.put<ApiResponse<IEmployee>>(`/employee/${id}`, data)

export const deleteEmployeeApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/employee/${id}`)
