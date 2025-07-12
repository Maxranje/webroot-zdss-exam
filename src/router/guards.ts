import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// 认证守卫
export const authGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore();

    // 初始化认证状态（如果未登录）
    if (!authStore.isLoggedIn) {
        await authStore.checkAuthStatus();
    }

    // 如果路由不需要认证，直接通过
    if (!to.meta?.requiresAuth) {
        return next();
    }

    // 检查是否已登录
    if (!authStore.isLoggedIn) {
        return next({
            path: "/login",
            query: { from: to.fullPath },
        });
    }

    // 验证 token 有效性
    try {
        const isValidToken = await authStore.validateToken();
        if (!isValidToken) {
            console.log("Token无效，自动登出并跳转到登录页");
            authStore.logout();
            return next({
                path: "/login",
                query: { from: to.fullPath },
            });
        }
    } catch (error) {
        console.error("Token 验证失败:", error);
        authStore.logout();
        return next({
            path: "/login",
            query: { from: to.fullPath },
        });
    }

    next();
};

// 登录页守卫
export const loginGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore();

    // 如果已登录用户访问登录页，重定向到首页
    if (to.path === "/login" && authStore.isLoggedIn) {
        if (authStore.getUserType === 11) {
            return next("/platform");
        } else if (authStore.getUserType === 13) {
            return next("/details");
        } else {
            return next("/profile");
        }
    }

    next();
};

// 页面标题守卫
export const titleGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // 设置页面标题
    if (to.meta?.title) {
        document.title = `${to.meta.title} - 中鼎模考平台`;
    }

    next();
};
