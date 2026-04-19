// src/types/department.ts

export interface IDepartment {
    deptId: number
    deptName: string
    deptSort: number
    status: number
    createTime: string
    remark: string
}

export interface CreateDepartmentForm {
    deptName: string
    deptSort: number
    status: number
    remark: string
}
