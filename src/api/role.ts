// src/api/role.ts
import request from './request'
import type { IRole, CreateRoleForm, UpdateRoleForm } from '../types/role'

export const getRolesApi = () =>
    request.get<IRole[]>('/admin/role')

export const getRoleApi = (id: string) =>
    request.get<IRole>(`/admin/role/${id}`)

export const createRoleApi = (data: CreateRoleForm) =>
    request.post<IRole>('/admin/role', data)

export const updateRoleApi = (id: string, data: UpdateRoleForm) =>
    request.put<null>(`/admin/role/${id}`, data)

export const deleteRoleApi = (id: string) =>
    request.delete<null>(`/admin/role/${id}`)

export const getRolePermissionIdsApi = (roleId: string) =>
    request.get<string[]>(`/admin/role/${roleId}/permissions`)

export const assignPermissionsApi = (roleId: string, permissionIds: string[]) =>
    request.put<null>(`/admin/role/${roleId}/permissions`, { permissionIds })
