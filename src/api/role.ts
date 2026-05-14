// src/api/role.ts
import request from './request'
import type { IRole, CreateRoleForm, UpdateRoleForm } from '../types/role'

export const getRolesApi = () =>
    request.get<IRole[]>('/admin/role')

export const getRoleApi = (id: number) =>
    request.get<IRole>(`/admin/role/${id}`)

export const createRoleApi = (data: CreateRoleForm) =>
    request.post<IRole>('/admin/role', data)

export const updateRoleApi = (id: number, data: UpdateRoleForm) =>
    request.put<null>(`/admin/role/${id}`, data)

export const deleteRoleApi = (id: number) =>
    request.delete<null>(`/admin/role/${id}`)

export const getRolePermissionIdsApi = (roleId: number) =>
    request.get<number[]>(`/admin/role/${roleId}/permissions`)

export const assignPermissionsApi = (roleId: number, permissionIds: number[]) =>
    request.put<null>(`/admin/role/${roleId}/permissions`, { permissionIds })
