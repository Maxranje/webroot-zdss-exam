<template>
    <div class="login-form-wrapper">
        <div class="login-form">
            <h3 class="form-title">修改密码</h3>

            <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" size="large">
                <el-form-item prop="username">
                    <el-input v-model="resetForm.username" placeholder="请输入用户名" prefix-icon="User" clearable />
                </el-form-item>

                <el-form-item prop="oldPassword">
                    <el-input
                        v-model="resetForm.oldPassword"
                        type="password"
                        placeholder="请输入旧密码"
                        prefix-icon="Lock"
                        show-password
                        clearable />
                </el-form-item>

                <el-form-item prop="newPassword">
                    <el-input
                        v-model="resetForm.newPassword"
                        type="password"
                        placeholder="请输入新密码"
                        prefix-icon="Lock"
                        show-password
                        clearable />
                </el-form-item>

                <el-form-item>
                    <div class="form-options">
                        <span></span>
                        <el-link type="primary" :underline="false" @click="$emit('switchToLogin')">去登录</el-link>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        style="width: 100%"
                        :loading="loading"
                        @click="handleResetPassword">
                        确认修改
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { ResetPasswordParams } from "@/types/auth";

const emit = defineEmits<{
    switchToLogin: [];
}>();

const authStore = useAuthStore();
const loading = ref(false);

const resetFormRef = ref<FormInstance>();
const resetForm = reactive<ResetPasswordParams>({
    username: "",
    oldPassword: "",
    newPassword: "",
});

const resetRules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
    newPassword: [
        { required: true, message: "请输入新密码", trigger: "blur" },
        { min: 6, message: "新密码长度至少6位", trigger: "blur" },
    ],
};

const validateResetForm = async (): Promise<boolean> => {
    if (!resetFormRef.value) return false;

    try {
        await resetFormRef.value.validate();
        return true;
    } catch {
        return false;
    }
};

const resetResetForm = () => {
    resetForm.username = "";
    resetForm.oldPassword = "";
    resetForm.newPassword = "";
    resetFormRef.value?.clearValidate();
};

// 修改密码处理
const handleResetPassword = async () => {
    try {
        const isValid = await validateResetForm();
        if (!isValid) return;

        loading.value = true;

        const result = await authStore.resetPassword({
            username: resetForm.username,
            oldPassword: resetForm.oldPassword,
            newPassword: resetForm.newPassword,
        });

        if (result.success) {
            ElMessage.success("密码修改成功，请使用新密码登录");
            resetResetForm();
            emit("switchToLogin");
        } else {
            ElMessage.error(result.message || "密码修改失败，请检查输入信息");
        }
    } catch (error) {
        console.error("修改密码请求失败:", error);
        ElMessage.error("修改密码失败，请检查网络连接");
    } finally {
        loading.value = false;
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
