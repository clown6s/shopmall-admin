// src/api/product.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type { CategoryTreeNode } from '../types/product'

// 获取商品三级分类树
export const getProductCategoryTreeApi = () =>
    request.get<ApiResponse<CategoryTreeNode[]>>('/product/reclassify')
