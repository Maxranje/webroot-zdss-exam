<template>
    <div class="login-page">
        <el-container>
            <el-header class="top-bar">
                <div class="logo"><img src="/img/logo.png" alt="Logo" /></div>
            </el-header>
            <el-main class="login-container">
                <div class="">
                    <!-- 背景轮播图 -->
                    <div class="carousel-bg">
                        <el-carousel :interval="5000" arrow="never" indicator-position="none">
                            <el-carousel-item v-for="item in backgroundImages" :key="item.id">
                                <div class="carousel-item" :style="{ backgroundImage: `url(${item.url})` }"></div>
                            </el-carousel-item>
                        </el-carousel>
                    </div>

                    <!-- 登录表单 -->
                    <LoginForm v-if="!isResetPassword" @switchToReset="showResetPassword" />

                    <!-- 修改密码表单 -->
                    <ResetPasswordForm v-if="isResetPassword" @switchToLogin="showLogin" />
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LoginForm from "./components/LoginForm.vue";
import ResetPasswordForm from "./components/ResetPasswordForm.vue";

// 控制显示登录还是修改密码表单
const isResetPassword = ref(false);

// 背景图片数据
const backgroundImages = [
    {
        id: 1,
        url: "/img/photo-1481627834876-b7833e8f5570.jpg",
    },
    {
        id: 2,
        url: "/img/photo-1503676260728-1c00da094a0b.jpg",
    },
    {
        id: 3,
        url: "/img/photo-1523050854058-8df90110c9f1.jpg",
    },
];

// 显示修改密码表单
const showResetPassword = () => {
    isResetPassword.value = true;
};

// 显示登录表单
const showLogin = () => {
    isResetPassword.value = false;
};
</script>

<style scoped lang="scss">
.login-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.top-bar {
    height: 60px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    padding: 0 20px;
    position: relative;
    z-index: 10;

    .logo img {
        height: 40px;
    }
}

.login-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10%;
}

.carousel-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;

    .carousel-item {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
}

:deep(.el-carousel) {
    height: 100%;
}

:deep(.el-carousel__container) {
    height: 100%;
}

:deep(.el-carousel__item) {
    height: 100%;
}

// 媒体查询：小屏幕适配
@media (max-width: 480px) {
    .login-container {
        justify-content: center;
        padding-right: 0;
        padding: 0 20px;
    }
}
</style>
