// src/types/role.ts

export interface IRole {
    id: number
    roleName: string
    roleKey: string
    description: string
    status: number
    createdAt: string
    updatedAt: string
}

export interface CreateRoleForm {
    roleName: string
    roleKey: string
    description: string
    status: number
}

export interface UpdateRoleForm extends CreateRoleForm {
    status: number
}
