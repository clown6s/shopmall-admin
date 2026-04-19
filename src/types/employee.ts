// src/types/employee.ts

export interface LoginResp {
    employeeId: string
    token: string
    phone: string
    realName: string
    avatar: string
    nickname: string
    canLogin: number
}

export interface IEmployee {
    employeeId: string
    nickname: string
    realName: string
    avatar: string
    gender: number
    age: number
    phone: string
    email: string
    department: string
    position: string
    workStatus: number
    loginStatus: number
    canLogin: number
    remark: string
    createTime: string
    roles: Array<{ roleId: string; roleName: string; roleKey: string }>
}

export interface CreateEmployeeForm {
    nickname: string
    realName: string
    password?: string
    avatar?: string
    gender?: number
    age?: number
    phone?: string
    email?: string
    department?: string
    position?: string
    workStatus?: number
    loginStatus?: number
    canLogin?: number
    roleIds?: string[]
    remark?: string
}
