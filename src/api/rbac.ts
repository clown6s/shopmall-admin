// src/api/rbac.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type {
    IRole,
    IPermission,
    IMenu,
    CreateRoleForm,
    CreatePermissionForm,
    CreateMenuForm,
    AssignPermissionsForm,
    AssignRolesForm,
} from '../types/rbac'

// ==================== 角色管理 ====================

// 获取角色列表
export const getRolesApi = (params?: { name?: string; status?: number }) =>
    request.get<ApiResponse<IRole[]>>('/roles', { params })

// 获取角色详情
export const getRoleApi = (id: number) =>
    request.get<ApiResponse<IRole>>(`/roles/${id}`)

// 创建角色
export const createRoleApi = (data: CreateRoleForm) =>
    request.post<ApiResponse<IRole>>('/roles', data)

// 更新角色
export const updateRoleApi = (id: number, data: CreateRoleForm) =>
    request.put<ApiResponse<IRole>>(`/roles/${id}`, data)

// 删除角色
export const deleteRoleApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/roles/${id}`)

// 获取角色权限
export const getRolePermissionsApi = (id: number) =>
    request.get<ApiResponse<number[]>>(`/roles/${id}/permissions`)

// 分配角色权限
export const assignRolePermissionsApi = (id: number, data: AssignPermissionsForm) =>
    request.post<ApiResponse<null>>(`/roles/${id}/permissions`, data)

// ==================== 权限管理 ====================

// 获取权限列表
export const getPermissionsApi = (params?: { type?: number; status?: number }) =>
    request.get<ApiResponse<IPermission[]>>('/permissions', { params })

// 获取权限树
export const getPermissionTreeApi = () =>
    request.get<ApiResponse<IPermission[]>>('/permissions/tree')

// 获取权限详情
export const getPermissionApi = (id: number) =>
    request.get<ApiResponse<IPermission>>(`/permissions/${id}`)

// 创建权限
export const createPermissionApi = (data: CreatePermissionForm) =>
    request.post<ApiResponse<IPermission>>('/permissions', data)

// 更新权限
export const updatePermissionApi = (id: number, data: CreatePermissionForm) =>
    request.put<ApiResponse<IPermission>>(`/permissions/${id}`, data)

// 删除权限
export const deletePermissionApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/permissions/${id}`)

// ==================== 菜单管理 ====================

// 获取菜单列表
export const getMenusApi = (params?: { status?: number }) =>
    request.get<ApiResponse<IMenu[]>>('/menus', { params })

// 获取菜单树
export const getMenuTreeApi = () =>
    request.get<ApiResponse<IMenu[]>>('/menus/tree')

// 获取菜单详情
export const getMenuApi = (id: number) =>
    request.get<ApiResponse<IMenu>>(`/menus/${id}`)

// 创建菜单
export const createMenuApi = (data: CreateMenuForm) =>
    request.post<ApiResponse<IMenu>>('/menus', data)

// 更新菜单
export const updateMenuApi = (id: number, data: CreateMenuForm) =>
    request.put<ApiResponse<IMenu>>(`/menus/${id}`, data)

// 删除菜单
export const deleteMenuApi = (id: number) =>
    request.delete<ApiResponse<null>>(`/menus/${id}`)

// ==================== 用户角色管理 ====================

// 获取用户角色
export const getUserRolesApi = (userId: number) =>
    request.get<ApiResponse<number[]>>(`/users/${userId}/roles`)

// 分配用户角色
export const assignUserRolesApi = (userId: number, data: AssignRolesForm) =>
    request.post<ApiResponse<null>>(`/users/${userId}/roles`, data)
