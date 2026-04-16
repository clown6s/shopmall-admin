// src/types/rbac.ts

// 权限
export interface IPermission {
    id: number
    code: string
    name: string
    type: number // 1-目录 2-菜单 3-按钮 4-接口
    parentId: number
    path: string
    component: string
    icon: string
    sort: number
    status: number // 0-禁用 1-启用
    createTime: string
    updateTime: string
    children?: IPermission[]
}

// 角色
export interface IRole {
    id: number
    name: string
    code: string
    description: string
    status: number // 0-禁用 1-启用
    createTime: string
    updateTime: string
}

// 菜单
export interface IMenu {
    id: number
    name: string
    path: string
    component: string
    icon: string
    sort: number
    parentId: number
    status: number // 0-禁用 1-启用
    permissionId: number
    createTime: string
    updateTime: string
    children?: IMenu[]
}

// 创建角色表单
export interface CreateRoleForm {
    name: string
    code: string
    description?: string
    status?: number
}

// 创建权限表单
export interface CreatePermissionForm {
    code: string
    name: string
    type: number
    parentId?: number
    path?: string
    component?: string
    icon?: string
    sort?: number
    status?: number
}

// 创建菜单表单
export interface CreateMenuForm {
    name: string
    path: string
    component?: string
    icon?: string
    sort?: number
    parentId?: number
    status?: number
    permissionId?: number
}

// 分配权限表单
export interface AssignPermissionsForm {
    permissionIds: number[]
}

// 分配角色表单
export interface AssignRolesForm {
    roleIds: number[]
}

// 权限类型枚举
export const PermissionTypeMap: Record<number, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' }> = {
    1: { label: '目录', color: 'primary' },
    2: { label: '菜单', color: 'success' },
    3: { label: '按钮', color: 'secondary' },
    4: { label: '接口', color: 'default' },
}

// 状态映射
export const StatusMap: Record<number, { label: string; color: 'success' | 'default' }> = {
    0: { label: '禁用', color: 'default' },
    1: { label: '启用', color: 'success' },
}
