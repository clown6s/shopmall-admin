// src/api/employee.ts
import request from './request'
import type { IEmployee, CreateEmployeeForm, LoginResp } from '../types/employee'

// 员工登录
export const loginApi = (phone: string, password: string) =>
    request.post<LoginResp>('/employee/login', { phone, password })

export const logoutApi = () =>
    request.post<null>('/auth/logout')

export const getProfileApi = () =>
    request.get<IEmployee>('/employee/profile')

export const getEmployeesApi = (params: {
    page: number
    pageSize: number
    realName?: string
    phone?: string
}) =>
    request.get<{ list: IEmployee[]; total: number; page: number; pageSize: number }>(
        '/employee/list',
        { params }
    )

export const getEmployeeApi = (id: number) =>
    request.get<IEmployee>(`/employee/${id}`)

export const createEmployeeApi = (data: CreateEmployeeForm) =>
    request.post<IEmployee>('/employee', data)

export const updateEmployeeApi = (id: number, data: CreateEmployeeForm) =>
    request.put<IEmployee>(`/employee/${id}`, data)

/** @deprecated 后端暂未实现员工删除接口，请勿使用 */
export const deleteEmployeeApi = (id: number) =>
    request.delete<null>(`/employee/${id}`)

export const resetPasswordApi = (id: number, newPassword: string) =>
    request.put<null>(`/employee/${id}/password`, { newPassword })
