import { createRouter, createWebHistory } from "vue-router";
import { authGuard, loginGuard, titleGuard } from "./guards";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: "/login",
        },
        {
            path: "/login",
            name: "Login",
            component: () => import("@/views/Login/LoginView.vue"),
            meta: {
                requiresAuth: false,
                title: "用户登录",
            },
        },
        {
            path: "/choice",
            name: "Choice",
            component: () => import("@/views/Choice/MainView.vue"),
            meta: {
                requiresAuth: true,
                title: "选择平台",
            },
        },
        // 合并所有指向个人中心的路由
        {
            path: "/profile",
            name: "Profile",
            component: () => import("@/views/Profile/MainView.vue"),
            meta: {
                requiresAuth: true,
                title: "个人中心",
            },
        },
        {
            path: "/platform",
            name: "Platform",
            component: () => import("@/views/Platform/MainView.vue"),
            meta: {
                requiresAuth: true,
                title: "管理平台",
            },
        },
        {
            path: "/details",
            name: "Details",
            component: () => import("@/views/Details/MainView.vue"),
            meta: {
                requiresAuth: true,
                title: "教师详情",
            },
        },
        {
            path: "/mock",
            name: "Mock",
            component: () => import("@/views/Mock/ExamView.vue"),
            meta: {
                requiresAuth: true,
                title: "模拟考试",
            },
        },
        {
            path: "/:pathMatch(.*)*",
            name: "NotFound",
            component: () => import("@/views/Error/404View.vue"),
            meta: {
                requiresAuth: false,
                title: "页面未找到",
            },
        },
    ],
});

// 注册路由守卫 - 调整顺序：先设置标题，再检查登录状态，最后验证权限
router.beforeEach(titleGuard);
router.beforeEach(loginGuard);
router.beforeEach(authGuard);

export default router;
