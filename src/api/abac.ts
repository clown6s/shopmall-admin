// src/api/abac.ts
import request from './request'
import type { ABACPolicy, CreateABACPolicyForm } from '../types/abac'

/** 表单 → 后端创建请求体 */
function formToCreateBody(form: CreateABACPolicyForm) {
    const subjectAttrs: Record<string, unknown> = {}
    if (form.departments.trim()) {
        subjectAttrs.departments = form.departments
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    }
    if (form.positions.trim()) {
        subjectAttrs.positions = form.positions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    }
    if (form.userIds.trim()) {
        subjectAttrs.user_ids = form.userIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number)
            .filter((n) => !isNaN(n))
    }
    const body: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        effect: form.effect,
        priority: form.priority,
        action: form.action,
        subjectAttrs,
        resourceAttrs: {},
    }
    if (form.pathPattern) {
        body.resourceAttrs = { path_pattern: form.pathPattern }
    }
    return body
}

/** 表单 → 后端更新请求体（全量字段） */
function formToUpdateBody(form: CreateABACPolicyForm) {
    const create = formToCreateBody(form)
    const body: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(create)) {
        body[k] = v
    }
    body.status = form.status
    return body
}

export const getABACPoliciesApi = () =>
    request.get<ABACPolicy[]>('/admin/abac')

export const getABACPolicyApi = (id: number) =>
    request.get<ABACPolicy>(`/admin/abac/${id}`)

export const createABACPolicyApi = (form: CreateABACPolicyForm) =>
    request.post<ABACPolicy>('/admin/abac', formToCreateBody(form))

export const updateABACPolicyApi = (id: number, form: CreateABACPolicyForm) =>
    request.put<null>(`/admin/abac/${id}`, formToUpdateBody(form))

export const deleteABACPolicyApi = (id: number) =>
    request.delete<null>(`/admin/abac/${id}`)
