// src/api/permission.ts
import request from './request'
import type { IPermission } from '../types/permission'

export const getPermissionsApi = () =>
    request.get<IPermission[]>('/admin/permission')

export const getPermissionApi = (id: number) =>
    request.get<IPermission>(`/admin/permission/${id}`)

export const createPermissionApi = (data: Record<string, unknown>) =>
    request.post<IPermission>('/admin/permission', data)

export const updatePermissionApi = (id: number, data: Record<string, unknown>) =>
    request.put<null>(`/admin/permission/${id}`, data)

export const deletePermissionApi = (id: number) =>
    request.delete<null>(`/admin/permission/${id}`)
