// src/types/api.ts
export interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}