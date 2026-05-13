// 从 Axios 错误中提取后端错误消息
interface AxiosLikeError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export function getApiErrorMsg(err: unknown, fallback = '操作失败'): string {
    return (err as AxiosLikeError)?.response?.data?.message ?? fallback;
}
