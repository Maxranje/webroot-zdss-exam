import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// 用户类型枚举
enum UserType {
    STUDENT = 12,
    TEACHER = 13,
}

// 角色类型枚举
enum RoleType {
    NO_ROLE = 0,
    HAS_ROLE = 1,
}

// 重定向到登录页的通用函数
const redirectToLogin = (to: RouteLocationNormalized, next: NavigationGuardNext) => {
    return next({
        path: "/login",
        query: { from: to.fullPath },
    });
};

// 重定向到错误页的通用函数
const redirectToError = (to: RouteLocationNormalized, next: NavigationGuardNext) => {
    return next({
        path: "/error",
        query: { from: to.fullPath },
    });
};

// 检查用户是否有权限访问指定路径
const hasPermissionToPath = (userType: number, roleType: number, path: string): boolean => {
    // 学生用户 (type=12) 只能访问 /profile 和 /mock
    if (userType == UserType.STUDENT) {
        return path == "/profile" || path == "/mock" || path == "/mock/detail";
    }

    if (userType == UserType.TEACHER && roleType == RoleType.HAS_ROLE) {
        return path == "/details" || path == "/platform" || path == "/choice";
    }

    // 教师用户 (type=13) 根据角色类型判断
    if (userType == UserType.TEACHER && roleType == RoleType.NO_ROLE) {
        return path == "/details";
    }

    // 平台用户 (type=11) 只能访问 /platform
    if (roleType == RoleType.HAS_ROLE) {
        return path == "/platform" || path == "/choice";
    }

    return false;
};

// 认证守卫
export const authGuard = async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore();
    console.log("authGuard", to.path);
    // 如果路由不需要认证，直接通过
    if (!to.meta?.requiresAuth) {
        return next();
    }

    // 初始化认证状态
    const hasValidAuth = authStore.checkAuthStatus();

    // 检查是否已登录
    if (!hasValidAuth) {
        console.log("redirectToLogin");
        return redirectToLogin(to, next);
    }

    // 验证 token 有效性
    try {
        const isValidToken = await authStore.validateToken();
        if (!isValidToken) {
            console.log("Token无效，自动登出并跳转到登录页");
            authStore.logout();
            return redirectToLogin(to, next);
        }
    } catch (error) {
        console.error("Token 验证失败:", error);
        authStore.logout();
        return redirectToLogin(to, next);
    }

    // 检查用户权限
    const userInfo = authStore.userInfo;
    if (userInfo && to.path !== "/login" && to.path !== "/error") {
        const hasPermission = hasPermissionToPath(userInfo.type, userInfo.roleType, to.path);
        console.log("hasPermission", hasPermission);
        if (!hasPermission) {
            return redirectToError(to, next);
        }
    }

    next();
};

// 登录页守卫
export const loginGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore();
    const hasValidAuth = authStore.checkAuthStatus();
    console.log("loginGuard", to.path);

    // 如果已登录用户访问登录页，重定向到对应首页
    if (to.path == "/login" && hasValidAuth) {
        const userType = authStore.getUserType;
        const userRoleType = authStore.getUserRoleType;

        let defaultPage = "/choice";

        if (userType == UserType.STUDENT) {
            defaultPage = "/profile";
        } else if (userRoleType == RoleType.HAS_ROLE) {
            defaultPage = "/choice";
        } else if (userType == UserType.TEACHER) {
            defaultPage = "/details";
        }

        console.log("userType", userType);
        console.log("userRoleType", userRoleType);
        console.log("重定向到默认页面:", defaultPage);

        return next(defaultPage);
    }

    next();
};

// 页面标题守卫
export const titleGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // 设置页面标题
    if (to.meta?.title) {
        document.title = `${to.meta.title} - 中鼎教育平台`;
    }

    next();
};
