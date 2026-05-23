// src/api/product.ts
import request from './request'
import type {CategoryTreeNode, Brand,CategoryParams,UpdateBrandParams,AddBrandParams,UpdateCategoryParams} from '../types/product'

// 获取商品三级分类树（后端返回纯数组）
// bustCache: 增删改后传 true，避免浏览器 304 缓存
export const getProductCategoryTreeApi = (bustCache = false) =>
    request.get<CategoryTreeNode[]>('/product/category', { params: bustCache ? { _t: Date.now() } : {} })

// 获取指定分类关联的品牌列表
export const getBrandsByCategoryApi = (catId: string) =>
    request.get<Brand[]>('/product/brands', { params: { catId } })

// 删除分类（逻辑删除）
export const deleteCategoryApi = (catId: string) =>
    request.delete<void>(`/product/category/${catId}`)

// 添加分类
export const addCategoryApi = (data: CategoryParams) =>
    request.post<void>('/product/category', data)

// 修改分类
export const updateCategoryApi = (catId: string, data: UpdateCategoryParams) =>
    request.put<void>('/product/category', { catId: Number(catId), ...data })


// 添加品牌
export const addBrandApi = (data: AddBrandParams) =>
    request.post<void>('/product/brand', data)



// 编辑品牌
export const updateBrandApi = (brandId: string, data: UpdateBrandParams) =>
    request.put<void>(`/product/brand/${brandId}`, data)

// 删除品牌
export const deleteBrandApi = (brandId: string) =>
    request.delete<void>(`/product/brand/${brandId}`)