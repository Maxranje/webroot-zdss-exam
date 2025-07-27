<template>
    <div class="login-form-wrapper">
        <div class="login-form">
            <h3 class="form-title">中鼎教育平台</h3>

            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" clearable />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        prefix-icon="Lock"
                        show-password
                        clearable />
                </el-form-item>

                <el-form-item>
                    <div class="form-options">
                        <el-checkbox v-model="rememberMe">记住用户名</el-checkbox>
                        <el-link type="primary" underline="never" @click="$emit('switchToReset')">修改密码</el-link>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        style="width: 100%"
                        :loading="authStore.loading"
                        @click="handleLogin">
                        登录系统
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, FormInstance } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { LoginParams } from "@/types/auth";
import * as utils from "@/utils/http";

const emit = defineEmits<{
    switchToReset: [];
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const rememberMe = ref(false);

// 记住用户名相关的 localStorage key
const REMEMBER_USERNAME_KEY = "remember-username";

const loginFormRef = ref<FormInstance>();
const loginForm = reactive<LoginParams>({
    username: "",
    password: "",
});

const loginRules = {
    username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        {
            pattern: /^[0-9a-zA-Z,]{1,20}$/,
            message: "用户名只能包含数字、英文或逗号，1-20个字符以内",
            trigger: "blur",
        },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        {
            pattern: /^[0-9a-zA-Z,]{6,20}$/,
            message: "密码只能包含数字、英文或逗号，6-20个字符以内",
            trigger: "blur",
        },
    ],
};

// 初始化时恢复保存的用户名
onMounted(() => {
    const savedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY);
    if (savedUsername) {
        loginForm.username = savedUsername;
        rememberMe.value = true;
    }
});

// 保存用户名到 localStorage
const saveUsername = (username: string) => {
    localStorage.setItem(REMEMBER_USERNAME_KEY, username);
};

// 清除保存的用户名
const clearSavedUsername = () => {
    localStorage.removeItem(REMEMBER_USERNAME_KEY);
};

const validateLoginForm = async (): Promise<boolean> => {
    if (!loginFormRef.value) return false;

    try {
        await loginFormRef.value.validate();
        return true;
    } catch {
        return false;
    }
};

// 登录处理
const handleLogin = async () => {
    try {
        const isValid = await validateLoginForm();
        if (!isValid) return;

        const result = await authStore.login({
            username: loginForm.username,
            password: loginForm.password,
        });

        if (result.success) {
            // 处理记住用户名功能
            if (rememberMe.value) {
                saveUsername(loginForm.username);
            } else {
                clearSavedUsername();
            }
            // 如果用户有权限（roleType > 0），则跳转到选择页面
            if (authStore.userInfo && authStore.userInfo.roleType == 1) {
                router.push("/choice");
            } else {
                router.push(result.redirect || "/profile");
            }
        } else {
            ElMessage.error(result.message || "登录失败，请检查用户名和密码");
        }
    } catch (error) {
        console.error("登录处理异常:", error);
        ElMessage.error("登录异常，请检查网络连接");
    }
};
</script>

<style scoped lang="scss">
.login-form-wrapper {
    position: relative;
    z-index: 2;
    width: 400px;
}

.login-form {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .form-title {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
        font-size: 20px;
        font-weight: 600;
    }

    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
}

// 媒体查询：小屏幕适配
@media (max-width: 480px) {
    .login-form-wrapper {
        width: 326px;
    }

    .login-form {
        padding: 30px 20px;
    }
}
</style>
