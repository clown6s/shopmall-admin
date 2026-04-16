// src/api/user.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type { IUser, LoginResp, CreateUserForm } from '../types/user'

export const loginApi = (mobile: string, password: string) =>
    request.post<ApiResponse<LoginResp>>('/login', { mobile, password })

export const getUsersApi = (params: {
    page: number
    pageSize: number
    name?: string
}) => request.get<ApiResponse<{ list: IUser[]; total: number; page: number; pageSize: number }>>('/users', { params })

export const createUserApi = (data: CreateUserForm) =>
    request.post<ApiResponse<IUser>>('/users', data)

export const deleteUserApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/users/${id}`)
