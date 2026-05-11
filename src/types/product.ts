// 显示状态映射：1=显示，2=隐藏（与后端一致）
export const SHOW_STATUS = {
    SHOWN: 1 as const,
    HIDDEN: 2 as const,
}

// boolean 转后端状态
export const toShowStatus = (shown: boolean): number => shown ? SHOW_STATUS.SHOWN : SHOW_STATUS.HIDDEN

// 后端状态转 boolean
export const fromShowStatus = (status: number): boolean => status === SHOW_STATUS.SHOWN

// 品牌
export interface Brand {
    brandId: string   // 用 string 避免大数字精度丢失
    name: string
    logo: string
    description: string
    showStatus: number
    firstLetter: string
    sort: number
}

// 后端分类树节点（与实际返回数据匹配）
export interface CategoryTreeNode {
    catId: number
    name: string
    sort?: number
    showStatus?: number
    children?: CategoryTreeNode[]
}

// MUI TreeView 需要的类型（只需 id, label, children）
export interface CategoryTreeItem {
    id: string
    label: string
    sort?: number
    showStatus?: number
    catLevel?: number
    parentCid?: number
    children?: CategoryTreeItem[]
}

// 转换为 MUI TreeView 格式
export function toTreeViewItems(nodes: CategoryTreeNode[]): CategoryTreeItem[] {
    return nodes.map((node) => ({
        id: String(node.catId),
        label: node.name,
        sort: node.sort,
        showStatus: node.showStatus,
        children: node.children && node.children.length > 0 ? toTreeViewItems(node.children) : undefined,
    }))
}

// 分类请求参数
export interface CategoryParams {
    name: string
    parentCid: number
    catLevel: number
    showStatus: number
    sort: number
}

// 编辑品牌参数
export interface UpdateBrandParams {
    name: string
    logo: string
    description: string
    showStatus: number
    firstLetter: string
    sort: number
}

// 添加品牌参数
export interface AddBrandParams {
    name: string
    logo: string
    description: string
    showStatus: number
    firstLetter: string
    sort: number
    catId: number        // 关联的三级分类ID
}


// 编辑分类参数（catId 由 updateCategoryApi 第一参数提供）
export interface UpdateCategoryParams {
    name: string
    sort: number
    showStatus: number
}