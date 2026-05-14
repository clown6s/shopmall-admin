// src/pages/ABAC/useABACPolicyData.ts
import type { ABACPolicy } from '../../types/abac'
import { getABACPoliciesApi } from '../../api/abac'
import { useSimpleListData } from '../../hooks/useSimpleListData'

export interface UseABACPolicyDataReturn {
    list: ABACPolicy[]
    loading: boolean
    error: string
    fetchData: () => Promise<void>
}

export function useABACPolicyData(): UseABACPolicyDataReturn {
    return useSimpleListData(getABACPoliciesApi, '获取策略列表失败')
}
