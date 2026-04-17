import type {TreeViewDefaultItemModelProperties} from '@mui/x-tree-view/models';

// 商品类型
export interface IProduct {
    id: number
    name: string
    price: number
}

// 旧数据（保留作为参考）
export const EMPLOYEES_DATASET: TreeViewDefaultItemModelProperties[] = [
    {
        id: '0',
        label: 'Sarah',
    },
    {
        id: '1',
        label: 'Thomas',
        children: [
            { id: '2', label: 'Robert' },
            { id: '3', label: 'Karen' },
            { id: '4', label: 'Nancy' },
            { id: '5', label: 'Daniel' },
            { id: '6', label: 'Christopher' },
            { id: '7', label: 'Donald' },
        ],
    },
    {
        id: '8',
        label: 'Mary',
        children: [
            {
                id: '9',
                label: 'Jennifer',
                children: [{ id: '10', label: 'Anna' }],
            },
            { id: '11', label: 'Michael' },
            {
                id: '12',
                label: 'Linda',
                children: [
                    { id: '13', label: 'Elizabeth' },
                    { id: '14', label: 'William' },
                ],
            },
        ],
    },
];

// 后端 CascaderNode 类型（商品分类树节点）
export interface CategoryTreeNode {
    catId: number
    name: string
    parentCid: number
    catLevel: number
    showStatus: number
    sort: number
    icon: string
    productUnit: string
    productCount: number
    children?: CategoryTreeNode[]
}

// 转换为 MUI TreeView 格式
export function toTreeViewItems(nodes: CategoryTreeNode[]): TreeViewDefaultItemModelProperties[] {
    return nodes.map((node) => ({
        id: String(node.catId),
        label: node.name,
        children: node.children && node.children.length > 0 ? toTreeViewItems(node.children) : undefined,
    }))
}
