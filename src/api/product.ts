// src/api/product.ts
import request from './request'
import type { ApiResponse } from '../types/api'
import type {CategoryTreeNode, Brand,CategoryParams} from '../types/product'

// 获取商品三级分类树（后端返回纯数组）
export const getProductCategoryTreeApi = () =>
    request.get<CategoryTreeNode[]>('/product/category')

// 获取指定分类关联的品牌列表
export const getBrandsByCategoryApi = (catId: string) =>
    request.get<ApiResponse<Brand[]>>('/product/brands', { params: { catId } })

// 删除分类（逻辑删除）
export const deleteCategoryApi = (catId: string) =>
    request.delete<ApiResponse<void>>(`/product/category/${catId}`)

// 添加分类
export const addCategoryApi = (data: CategoryParams) =>
    request.post<ApiResponse<void>>('/product/category', data)

// 编辑分类参数（catId 由 updateCategoryApi 第一参数提供）
export interface UpdateCategoryParams {
    name: string
    sort: number
    showStatus: number
}

// 修改分类
export const updateCategoryApi = (catId: string, data: UpdateCategoryParams) =>
    request.put<ApiResponse<void>>('/product/category', { catId: Number(catId), ...data })

// 添加品牌参数
export interface AddBrandParams {
    name: string
    logo: string
    descript: string
    showStatus: number
    firstLetter: string
    sort: number
    catId: number        // 关联的三级分类ID
}

// 添加品牌
export const addBrandApi = (data: AddBrandParams) =>
    request.post<ApiResponse<void>>('/product/brand', data)

// 编辑品牌参数
export interface UpdateBrandParams {
    name: string
    logo: string
    descript: string
    showStatus: number
    firstLetter: string
    sort: number
}

// 编辑品牌
export const updateBrandApi = (brandId: string, data: UpdateBrandParams) =>
    request.put<ApiResponse<void>>(`/product/brand/${brandId}`, data)

// 删除品牌
export const deleteBrandApi = (brandId: string) =>
    request.delete<ApiResponse<void>>(`/product/brand/${brandId}`)