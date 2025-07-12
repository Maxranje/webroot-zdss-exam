import type { ApiResponse } from "@/types/auth";

interface HttpOptions extends RequestInit {
    requireAuth?: boolean;
}

// 创建一个全局的 fetch 包装器
export const createAuthenticatedFetch = (getToken: () => string | null, onUnauthorized: () => void) => {
    return async (url: string, options: HttpOptions = {}) => {
        const { requireAuth = true, ...fetchOptions } = options;
        const token = getToken();

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(fetchOptions.headers as Record<string, string>),
        };

        // 如果需要认证且有 token，添加到请求头
        if (requireAuth && token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            credentials: "include",
        });

        // 处理 401 状态码
        if (response.status === 401) {
            onUnauthorized();
            throw new Error("Unauthorized");
        }

        return response;
    };
};

// 统一的API响应处理
export const handleApiResponse = async <T = any>(response: Response): Promise<ApiResponse<T>> => {
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.msg || `HTTP Error: ${response.status}`);
    }

    return result;
};

// 存储相关工具函数
export const storage = {
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        } catch (error) {
            console.error(`存储失败 ${key}:`, error);
        }
    },

    get: <T = any>(key: string, defaultValue: T | null = null): T | null => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            try {
                return JSON.parse(item);
            } catch {
                return item as T;
            }
        } catch (error) {
            console.error(`读取存储失败 ${key}:`, error);
            return defaultValue;
        }
    },

    remove: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`删除存储失败 ${key}:`, error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error("清空存储失败:", error);
        }
    },
};
