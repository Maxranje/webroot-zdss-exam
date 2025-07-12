<template>
    <div class="login-form-wrapper">
        <div class="login-form">
            <h3 class="form-title">账户密码登录</h3>

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
                        <el-link type="primary" :underline="false" @click="$emit('switchToReset')">修改密码</el-link>
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
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { useLoginForm } from "@/composables/useForm";

defineEmits<{
    switchToReset: [];
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const rememberMe = ref(false);

const { loginFormRef, loginForm, loginRules, validateLoginForm } = useLoginForm();

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
            ElMessage.success("登录成功");

            // 获取重定向路径
            const redirectPath = (route.query.redirect as string) || "/profile";
            router.push(redirectPath);
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
