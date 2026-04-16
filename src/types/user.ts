// src/types/user.ts

export interface IUser {
    id: number
    name: string
    phone: string
    email: string
    age: number
    gender: number   // 1男 2女 3未知
    avatar: string
    remark: string
    createdAt: string
    updatedAt: string
}

export interface LoginResp {
    token: string
    expiresIn: number
    userId: number
    name: string
}

export interface CreateUserForm {
    name: string
    password: string
    phone: string
    email?: string
    age?: number
    gender?: number
    deviceInfo: string
    remark?: string
}
