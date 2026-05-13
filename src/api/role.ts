// src/api/role.ts
import request from './request'
import type { IRole } from '../types/role'

export const getRolesApi = () =>
    request.get<IRole[]>('/admin/role')

export const getRoleApi = (id: number) =>
    request.get<IRole>(`/admin/role/${id}`)

export const createRoleApi = (data: { roleName: string; roleKey: string; description: string }) =>
    request.post<IRole>('/admin/role', data)

export const updateRoleApi = (id: number, data: Record<string, unknown>) =>
    request.put<null>(`/admin/role/${id}`, data)

export const deleteRoleApi = (id: number) =>
    request.delete<null>(`/admin/role/${id}`)

export const getRolePermissionIdsApi = (roleId: number) =>
    request.get<number[]>(`/admin/role/${roleId}/permissions`)

export const assignPermissionsApi = (roleId: number, permissionIds: number[]) =>
    request.put<null>(`/admin/role/${roleId}/permissions`, { permissionIds })
