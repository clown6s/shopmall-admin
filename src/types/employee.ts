// src/types/employee.ts

export interface LoginResp {
    employeeId: string
    token: string
    phone: string
    realName: string
    avatar: string
    canLogin: number
}

export interface IEmployee {
    employeeId: string
    realName: string
    avatar: string
    gender: number
    age: number
    phone: string
    email: string
    department: string
    position: string
    role: string
    workStatus: number
    loginStatus: number
    canLogin: number
    remark: string
    createTime: string
}

export interface CreateEmployeeForm {
    realName: string
    password?: string
    avatar?: string
    gender?: number
    age?: number
    phone?: string
    email?: string
    department?: string
    position?: string
    role?: string
    workStatus?: number
    loginStatus?: number
    canLogin?: number
    remark?: string
}
