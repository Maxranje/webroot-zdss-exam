import { createRouter, createWebHistory } from "vue-router";
import { filterGuard, authGuard, loginGuard, titleGuard } from "./guards";

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
            path: "/mock/detail",
            name: "MockDetail",
            component: () => import("@/views/Mock/DetailView.vue"),
            meta: {
                requiresAuth: true,
                title: "考试报告",
            },
        },
        {
            path: "/mock/detail/:id",
            name: "MockDetailWithId",
            component: () => import("@/views/Mock/DetailView.vue"),
            meta: {
                requiresAuth: true,
                title: "考试报告",
            },
        },
        {
            path: "/finish",
            name: "finish",
            component: () => import("@/views/Mock/FinishView.vue"),
            meta: {
                requiresAuth: false,
                title: "考试完成",
            },
        },
        {
            path: "/error",
            name: "error",
            component: () => import("@/views/Error/500View.vue"),
            meta: {
                requiresAuth: false,
                title: "系统异常",
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

// 注册路由守卫 - 调整顺序：先过滤, 在设置标题，再进行认证检查，最后处理登录重定向
router.beforeEach(filterGuard); // 过滤以/mapi开头的请求
router.beforeEach(titleGuard);
router.beforeEach(authGuard); // 先进行认证和权限检查
router.beforeEach(loginGuard); // 后处理登录页面重定向

export default router;
