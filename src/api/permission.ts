// src/api/permission.ts
import request from './request'
import type { IPermission, CreatePermissionForm } from '../types/permission'

export const getPermissionsApi = () =>
    request.get<IPermission[]>('/admin/permission')

export const getPermissionApi = (id: number) =>
    request.get<IPermission>(`/admin/permission/${id}`)

export const createPermissionApi = (data: CreatePermissionForm) =>
    request.post<IPermission>('/admin/permission', data)

export const updatePermissionApi = (id: number, data: CreatePermissionForm) =>
    request.put<null>(`/admin/permission/${id}`, data)

export const deletePermissionApi = (id: number) =>
    request.delete<null>(`/admin/permission/${id}`)
