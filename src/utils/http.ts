import type { ApiResponse } from "@/types/auth";

// 统一的API响应处理
export const handleApiResponse = async <T = any>(response: Response): Promise<ApiResponse<T>> => {
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.msg || `HTTP Error: ${response.status}`);
    }

    return result;
};

// 需要认证的API请求处理函数
export const fetchAuthRequest = (getToken: () => string | null, onUnauthorized: () => void) => {
    return async <T = any>(url: string, method: string, body?: any) => {
        const token = getToken();

        // 只有当不是FormData时才设置Content-Type
        const headers: Record<string, string> = {};
        if (!(body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        // 如果有 token，添加到请求头
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });

        // 处理 401 状态码
        if (response.status === 401) {
            onUnauthorized();
            throw new Error("Unauthorized");
        }

        return handleApiResponse<T>(response);
    };
};

// 普通的API请求处理函数（不需要认证）
export const fetchApiRequest = async <T = any>(url: string, method: string, body?: any): Promise<ApiResponse<T>> => {
    // 只有当不是FormData时才设置Content-Type
    const headers: Record<string, string> = {};
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    return handleApiResponse<T>(response);
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

// window 重定向
export const redirectWindow = (path: string) => {
    // 重定向到外部管理平台
    const currentOrigin = window.location.origin;
    const redirectUrl = `${currentOrigin}${path}`;
    window.location.href = redirectUrl;
};
