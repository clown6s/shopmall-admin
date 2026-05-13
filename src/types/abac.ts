// src/types/abac.ts

/** ABAC 策略响应结构 */
export interface ABACPolicy {
    id: number
    name: string
    description: string
    effect: 'allow' | 'deny'
    priority: number
    subjectAttrs: Record<string, unknown>
    resourceAttrs: Record<string, unknown>
    action: string
    status: number
    createdAt: string
    updatedAt: string
}

/** ABAC 策略创建/编辑表单（友好的扁平结构） */
export interface CreateABACPolicyForm {
    name: string
    description: string
    effect: 'allow' | 'deny'
    priority: number
    pathPattern: string       // → resourceAttrs.path_pattern
    departments: string       // 逗号分隔 → subjectAttrs.departments[]
    positions: string         // 逗号分隔 → subjectAttrs.positions[]
    userIds: string           // 逗号分隔 → subjectAttrs.user_ids[]
    action: string            // GET/POST/PUT/DELETE/*
    status: number
}
