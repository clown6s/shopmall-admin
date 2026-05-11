// src/types/employee.ts

export interface EmployeeInfo {
    id: number
    realName: string
    phone: string
    avatar: string
    gender: number
    department: string
    position: string
    role: string
}

// 注意：后端通过 httpOnly cookie 设置认证，响应体中的 token 字段是冗余的
export interface LoginResp {
    token: string
    employeeInfo: EmployeeInfo
}

export interface IEmployee {
    id: number
    realName: string
    avatar: string
    gender: number
    age?: number
    phone: string
    email?: string
    department: string
    position: string
    role: string
    workStatus: number
    canLogin: number
    remark?: string
    createTime?: string
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
    canLogin?: number
    remark?: string
}
