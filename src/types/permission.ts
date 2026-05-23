// src/types/permission.ts

export interface IPermission {
    id: string  // 后端 BIGINT
    permissionName: string
    permissionKey: string
    type: number       // 1=菜单 2=按钮 3=API
    parentId: string   // 后端 BIGINT
    path: string
    method: string
    sortOrder: number
    status: number
    createdAt: string
    updatedAt: string
    children?: IPermission[]
}

export interface CreatePermissionForm {
    permissionName: string
    permissionKey: string
    type: number
    parentId: string
    path: string
    method: string
    sortOrder: number
    status: number
}
