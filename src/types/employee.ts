// src/types/employee.ts

export interface EmployeeInfo {
    employeeId: string  // 后端 BIGINT，通过 json-bigint 转为 string
    realName: string
    phone: string
    avatar: string
    gender: number
    department: string
    position: string
    role: string
    workStatus: number
    canLogin: number
    createTime: string
}

// 后端通过 httpOnly cookie 设置认证，响应体不含 token
export interface LoginResp {
    employeeInfo: EmployeeInfo
}

export interface IEmployee {
    employeeId: string
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
