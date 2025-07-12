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
            path: "/profile",
            name: "Profile",
            component: () => import("@/views/Profile/MainView.vue"),
            meta: {
                requiresAuth: true,
                title: "个人中心",
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
            redirect: "/login",
        },
    ],
});

// 注册路由守卫
router.beforeEach(titleGuard);
router.beforeEach(authGuard);
router.beforeEach(loginGuard);

export default router;
