import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// Element Plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 全局样式
import "./styles/index.scss";

// 创建应用实例
const app = createApp(App);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 注册插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// 初始化应用
const initApp = async () => {
    try {
        // 初始化认证状态
        const { useAuthStore } = await import("./stores/index");
        const authStore = useAuthStore();
        authStore.initAuth();

        // 挂载应用
        app.mount("#app");
    } catch (error) {
        console.error("应用初始化失败:", error);
        // 即使初始化失败也要挂载应用
        app.mount("#app");
    }
};

initApp();
