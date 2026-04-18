// src/api/product.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type {CategoryTreeNode, Brand,CategoryParams} from '../types/product'

// 获取商品三级分类树
export const getProductCategoryTreeApi = () =>
    request.get<ApiResponse<CategoryTreeNode[]>>('/product/reclassify')

// 获取指定分类关联的品牌列表
export const getBrandsByCategoryApi = (catId: number) =>
    request.get<ApiResponse<Brand[]>>('/product/brands', { params: { catId } })

export const deleteCategoryApi = (catId: number) =>
    request.delete<ApiResponse<void>>(`/product/category/${catId}`)


// 添加分类（showStatus 布尔转数字）
export const addCategoryApi = (data: CategoryParams) =>
    request.post<ApiResponse<void>>('/product/category', {...data})

// 修改分类（showStatus 布尔转数字）
export const updateCategoryApi = (catId: number, data: CategoryParams) =>
    request.put<ApiResponse<void>>(`/product/category/${catId}`, {...data})