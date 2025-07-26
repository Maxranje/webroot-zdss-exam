import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Router } from "vue-router";
import type { LoginParams, UserInfo, LoginResponse } from "@/types/auth";
import { storage, fetchAuthRequest, fetchApiRequest } from "@/utils/http";

const STORAGE_KEYS = {
    TOKEN: "auth-token",
    USER_INFO: "user-info",
    IS_LOGGED_IN: "is-logged-in",
} as const;

const VALIDATE_INTERVAL = 4 * 60 * 60 * 1000; // 4小时缓存时间

export const useAuthStore = defineStore("auth", () => {
    // 状态
    const userInfo = ref<UserInfo | null>(null);
    const token = ref<string | null>(null);
    const loading = ref(false);

    // 用简单变量替代响应式状态
    let lastValidateTime = 0;

    // 计算属性
    const isLoggedIn = computed(() => !!token.value);
    const hasToken = computed(() => !!token.value);

    // 用户类型 12: 学生 13: 老师, 11:管理员
    const getUserType = computed(() => {
        return userInfo.value?.type || 0;
    });
    // 用户角色类型 0: 老师 1: 管理员
    const getUserRoleType = computed(() => {
        return userInfo.value?.roleType || 0;
    });

    // 处理认证失败的函数
    const handleUnauthorized = () => {
        logout();
    };

    // 定义 auht请求方法
    const fetchAuthReq = (url: string, method: string, body?: any) => {
        return fetchAuthRequest(() => token.value, handleUnauthorized)(url, method, body);
    };

    // 从localStorage恢复认证状态
    const restoreAuthFromStorage = () => {
        const storedToken = storage.get<string>(STORAGE_KEYS.TOKEN);
        const storedUserInfo = storage.get<UserInfo>(STORAGE_KEYS.USER_INFO);
        const storedIsLoggedIn = storage.get<string>(STORAGE_KEYS.IS_LOGGED_IN);
        // 修复：storedIsLoggedIn 可能是数字 1 或字符串 "1"，使用 == 进行比较
        if (storedToken && storedUserInfo && storedIsLoggedIn == "1") {
            token.value = storedToken;
            userInfo.value = storedUserInfo;
            console.log("restoreAuthFromStorage - 认证状态恢复成功");
            return true;
        }

        console.log("restoreAuthFromStorage - 认证状态恢复失败");
        return false;
    };

    // 保存认证状态到localStorage
    const saveAuthState = (authToken: string, user: UserInfo) => {
        token.value = authToken;
        userInfo.value = user;
        lastValidateTime = Date.now(); // 重置验证缓存

        storage.set(STORAGE_KEYS.TOKEN, authToken);
        storage.set(STORAGE_KEYS.USER_INFO, user);
        storage.set(STORAGE_KEYS.IS_LOGGED_IN, "1");
    };

    // 清除认证状态
    const clearAuthState = () => {
        userInfo.value = null;
        token.value = null;
        lastValidateTime = 0;

        storage.remove(STORAGE_KEYS.TOKEN);
        storage.remove(STORAGE_KEYS.USER_INFO);
        storage.remove(STORAGE_KEYS.IS_LOGGED_IN);
    };

    // 登录
    const login = async (params: LoginParams): Promise<{ success: boolean; message?: string; redirect?: string }> => {
        loading.value = true;

        try {
            const result: LoginResponse = await fetchApiRequest("/mapi/sign/in", "POST", params);

            if (result.status === 0) {
                saveAuthState(result.data.auth_token, result.data.user);
                return { success: true, redirect: result.data.redirect || "/profile" };
            } else if (result.status === 405) {
                return { success: false, message: result.msg || "登录失败" };
            } else {
                return { success: false, message: "登录失败, 请重试" };
            }
        } catch (error) {
            console.error("登录请求失败:", error);
            return { success: false, message: error instanceof Error ? error.message : "网络错误，请重试" };
        } finally {
            loading.value = false;
        }
    };

    // 登出
    const logout = async (router?: Router) => {
        const currentToken = token.value;

        // 先清除本地状态
        clearAuthState();

        // 调用登出接口清除服务端session
        if (currentToken) {
            try {
                await fetchAuthReq("/mapi/sign/out", "POST");
            } catch (error) {
                console.error("登出接口调用失败:", error);
            }
        }

        // 跳转到登录页
        if (router) {
            router.push("/login");
        }
    };

    // 检查认证状态（合并initAuth功能）
    const checkAuthStatus = () => {
        return restoreAuthFromStorage();
    };

    // 验证 token 有效性（内联缓存检查逻辑）
    const validateToken = async (forceValidate: boolean = false): Promise<boolean> => {
        if (!token.value) return false;

        // 检查是否需要验证（基于缓存时间）
        const now = Date.now();
        const shouldValidate = now - lastValidateTime > VALIDATE_INTERVAL;

        if (!forceValidate && !shouldValidate) {
            return true;
        }

        try {
            const result = await fetchAuthReq("/mapi/sign/check", "GET");

            if (result.status === 0) {
                // 如果result.data.author_token && user 存在，则更新token和 user 信息
                if (result.data.author_token && result.data.user) {
                    token.value = result.data.author_token;
                    userInfo.value = result.data.user;
                    storage.set(STORAGE_KEYS.TOKEN, result.data.author_token);
                    storage.set(STORAGE_KEYS.USER_INFO, result.data.user);
                }
                lastValidateTime = Date.now();
                return true;
            } else {
                lastValidateTime = 0;
                return false;
            }
        } catch (error) {
            console.error("Token 验证失败:", error);
            lastValidateTime = 0;
            return false;
        }
    };

    // 重置密码
    const resetPassword = async (params: {
        username: string;
        oldPassword: string;
        newPassword: string;
    }): Promise<{ success: boolean; message?: string }> => {
        try {
            const result = await fetchApiRequest("/mapi/sign/reset", "POST", params);

            if (result.status === 0) {
                return { success: true };
            } else {
                return { success: false, message: result.msg || "密码修改失败" };
            }
        } catch (error) {
            console.error("修改密码请求失败:", error);
            return { success: false, message: error instanceof Error ? error.message : "网络错误，请重试" };
        }
    };

    return {
        // 状态
        isLoggedIn,
        userInfo,
        token,
        loading,
        hasToken,
        getUserType,
        getUserRoleType,

        // 方法
        login,
        logout,
        checkAuthStatus,
        validateToken,
        resetPassword,
        fetchAuthReq,
        fetchApiRequest,
    };
});
