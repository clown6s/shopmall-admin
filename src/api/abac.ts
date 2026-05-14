// src/api/abac.ts
import request from './request'
import type {
    ABACPolicy,
    ABACSubjectAttrs,
    ABACResourceAttrs,
    ABACPolicyCreateBody,
    ABACPolicyUpdateBody,
    CreateABACPolicyForm,
} from '../types/abac'

/** 表单 → 后端创建请求体 */
function formToCreateBody(form: CreateABACPolicyForm): ABACPolicyCreateBody {
    const subjectAttrs: ABACSubjectAttrs = {}
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
    const resourceAttrs: ABACResourceAttrs = form.pathPattern
        ? { path_pattern: form.pathPattern }
        : {}
    const body: ABACPolicyCreateBody = {
        name: form.name,
        description: form.description,
        effect: form.effect,
        priority: form.priority,
        action: form.action,
        subjectAttrs,
        resourceAttrs,
    }
    return body
}

/** 表单 → 后端更新请求体（全量字段） */
function formToUpdateBody(form: CreateABACPolicyForm): ABACPolicyUpdateBody {
    const create = formToCreateBody(form)
    const body: ABACPolicyUpdateBody = {
        ...create,
        status: form.status,
    }
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
