<template>
    <div class="choice-page">
        <div class="background-image"></div>
        <el-container>
            <!-- 顶部导航栏 -->
            <el-header class="top-bar">
                <div class="logo"><img src="/img/logo.png" alt="Logo" /></div>
            </el-header>
            <el-main class="main-content">
                <!-- 左侧内容 -->
                <div class="left-content">
                    <div class="welcome-section">
                        <h1 class="welcome-title">中鼎教育平台</h1>
                        <p class="welcome-subtitle">探索智慧学习新境界，开启教育数字化未来</p>
                        <div class="feature-list">
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <el-icon><Calendar /></el-icon>
                                </div>
                                <span>智能课程管理</span>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <el-icon><Histogram /></el-icon>
                                </div>
                                <span>数据分析评估</span>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <el-icon><MagicStick /></el-icon>
                                </div>
                                <span>AI智能模考</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧选择区域 -->
                <div class="right-content">
                    <div class="choice-container">
                        <!-- 用户信息 -->
                        <div class="user-info">
                            <div class="user-avatar">
                                <el-avatar :size="40" :src="userInfo?.avatar">
                                    {{ userInfo?.nickname?.charAt(0) || "U" }}
                                </el-avatar>
                            </div>
                            <div class="user-details">
                                <div class="user-name">{{ userInfo?.nickname || "用户" }}</div>
                            </div>
                            <el-button type="text" class="logout-btn" @click="handleLogout">
                                <el-icon><SwitchButton /></el-icon>
                                退出
                            </el-button>
                        </div>

                        <!-- 选择标题 -->
                        <div class="choice-header">
                            <h2 class="choice-title">选择您要访问的服务</h2>
                        </div>

                        <!-- 选择卡片 -->
                        <div class="choice-cards">
                            <!-- 排课平台卡片 -->
                            <div class="choice-card platform-card" @click="goToPlatform">
                                <div class="card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8 2V5"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M16 2V5"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M3 10H21"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                                            stroke="currentColor"
                                            stroke-width="2" />
                                        <path
                                            d="M8 14H10"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M8 18H10"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M14 14H16"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                        <path
                                            d="M14 18H16"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round" />
                                    </svg>
                                </div>
                                <div class="card-content">
                                    <h3 class="card-title">排课平台</h3>
                                    <div class="card-features">
                                        <span class="feature-tag">课程管理</span>
                                        <span class="feature-tag">留学服务</span>
                                        <span class="feature-tag">权限中心</span>
                                    </div>
                                </div>
                                <div class="card-arrow">
                                    <el-icon><ArrowRight /></el-icon>
                                </div>
                            </div>

                            <!-- 模考平台卡片 -->
                            <div class="choice-card mock-card" @click="goToMock">
                                <div class="card-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9 12L11 14L15 10"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path
                                            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                            stroke="currentColor"
                                            stroke-width="2" />
                                        <path
                                            d="M12 7V12L15 15"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="card-content">
                                    <h3 class="card-title">模考中心</h3>
                                    <div class="card-features">
                                        <span class="feature-tag">题库中心</span>
                                        <span class="feature-tag">数据分析</span>
                                    </div>
                                </div>
                                <div class="card-arrow">
                                    <el-icon><ArrowRight /></el-icon>
                                </div>
                            </div>
                        </div>

                        <!-- 底部提示 -->
                        <div class="choice-footer">
                            <div class="footer-tip">
                                <el-icon><InfoFilled /></el-icon>
                                <span>您可以根据需要随时切换平台，所有数据将自动同步</span>
                            </div>
                        </div>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowRight, SwitchButton, InfoFilled, ChatRound } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import * as utils from "@/utils/http";

const router = useRouter();
const authStore = useAuthStore();

const userInfo = computed(() => authStore.userInfo);

// 跳转到排课平台
const goToPlatform = () => {
    try {
        ElMessage.success("正在跳转到排课平台...");
        setTimeout(() => {
            utils.redirectWindow("/mapi/dashboard/page");
        }, 500);
    } catch (error) {
        console.error("跳转排课平台失败:", error);
        ElMessage.error("跳转失败，请重试");
    }
};

// 跳转到模考平台
const goToMock = () => {
    try {
        ElMessage.success("正在跳转到模考平台...");
        setTimeout(() => {
            utils.redirectWindow("/mapi/dashboard/mock");
        }, 500);
    } catch (error) {
        console.error("跳转模考平台失败:", error);
        ElMessage.error("跳转失败，请重试");
    }
};

// 退出登录
const handleLogout = async () => {
    try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });

        await authStore.logout(router);
    } catch (error) {
        if (error !== "cancel") {
            console.error("退出登录失败:", error);
            ElMessage.error("退出登录失败，请重试");
        }
    }
};
</script>

<style scoped lang="scss">
.choice-page {
    min-height: 100vh;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
}

.background-image {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23e0f2fe;stop-opacity:1" /><stop offset="50%" style="stop-color:%23f0f9ff;stop-opacity:1" /><stop offset="100%" style="stop-color:%23f8fafc;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23grad1)"/><circle cx="200" cy="200" r="100" fill="%23dbeafe" opacity="0.3"/><circle cx="1720" cy="300" r="150" fill="%23e0e7ff" opacity="0.2"/><circle cx="400" cy="800" r="80" fill="%23fef3c7" opacity="0.3"/><circle cx="1600" cy="700" r="120" fill="%23fce7f3" opacity="0.2"/></svg>');
    background-size: cover;
    background-position: center;
    z-index: 1;
    overflow: hidden;
}

.top-bar {
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
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

.main-content {
    position: relative;
    z-index: 2;
    display: flex;
    min-height: calc(100vh - 60px);
    padding: 40px;
    gap: 40px;
}

.left-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.welcome-section {
    max-width: 500px;
    text-align: left;
}

.welcome-title {
    font-size: 3.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
    line-height: 1.1;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.welcome-subtitle {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 32px;
    line-height: 1.6;
}

.feature-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.1rem;
    color: #475569;
    font-weight: 500;
}

.feature-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
}

.right-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.choice-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 500px;
    width: 100%;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.user-details {
    flex: 1;
}

.user-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
}

.user-role {
    font-size: 0.9rem;
    color: #64748b;
}

.logout-btn {
    color: #64748b;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
}

.choice-header {
    text-align: center;
    margin-bottom: 32px;
}

.choice-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

.choice-subtitle {
    font-size: 1rem;
    color: #64748b;
}

.choice-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
}

.choice-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        border-color: rgba(59, 130, 246, 0.2);

        &::before {
            opacity: 1;
        }

        .card-arrow {
            transform: translateX(4px);
            color: #3b82f6;
        }
    }

    &.platform-card:hover {
        border-color: rgba(59, 130, 246, 0.3);
    }

    &.mock-card:hover {
        border-color: rgba(168, 85, 247, 0.3);
    }
}

.card-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 12px;
    color: white;
    flex-shrink: 0;

    svg {
        width: 24px;
        height: 24px;
    }
}

.card-content {
    flex: 1;
}

.card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
}

.card-description {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 12px;
    line-height: 1.5;
}

.card-features {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.feature-tag {
    font-size: 0.75rem;
    padding: 4px 8px;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    border-radius: 6px;
    font-weight: 500;
}

.card-arrow {
    color: #94a3b8;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.choice-footer {
    text-align: center;
}

.footer-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.85rem;
    color: #64748b;
    padding: 12px;
    background: rgba(59, 130, 246, 0.05);
    border-radius: 8px;
}

@media (max-width: 820px) {
    .main-content {
        flex-direction: column;
        padding: 20px;
        gap: 20px;
    }

    .left-content {
        padding: 20px 0;
    }

    .welcome-title {
        font-size: 2.5rem;
    }

    .welcome-subtitle {
        font-size: 1.1rem;
    }

    .choice-container {
        padding: 30px;
    }
}

@media (max-width: 480px) {
    .top-bar {
        padding: 0 16px;
    }

    .main-content {
        padding: 12px;
        gap: 16px;
    }

    .left-content {
        display: none;
    }

    .feature-icon {
        width: 32px;
        height: 32px;
        font-size: 1.2rem;
    }

    .choice-container {
        padding: 20px;
    }

    .user-info {
        margin-bottom: 24px;
        padding-bottom: 16px;
    }

    .user-name {
        font-size: 1rem;
    }

    .user-role {
        font-size: 0.8rem;
    }

    .choice-header {
        margin-bottom: 24px;
    }

    .choice-title {
        font-size: 1.3rem;
    }

    .choice-subtitle {
        font-size: 0.9rem;
    }

    .choice-cards {
        gap: 12px;
        margin-bottom: 24px;
    }

    .choice-card {
        padding: 16px;
        gap: 12px;
    }

    .card-icon {
        width: 36px;
        height: 36px;

        svg {
            width: 18px;
            height: 18px;
        }
    }

    .card-title {
        font-size: 1.1rem;
    }

    .card-description {
        font-size: 0.85rem;
    }

    .feature-tag {
        font-size: 0.7rem;
        padding: 3px 6px;
    }

    .footer-tip {
        font-size: 0.8rem;
        padding: 10px;
    }
}

@media (max-height: 600px) {
    .main-content {
        padding: 12px;
    }

    .welcome-title {
        font-size: 1.6rem;
        margin-bottom: 8px;
    }

    .welcome-subtitle {
        font-size: 0.85rem;
        margin-bottom: 16px;
    }

    .choice-container {
        padding: 16px;
    }

    .user-info {
        margin-bottom: 16px;
        padding-bottom: 12px;
    }

    .choice-header {
        margin-bottom: 16px;
    }

    .choice-cards {
        gap: 8px;
        margin-bottom: 16px;
    }

    .choice-card {
        padding: 12px;
    }
}
</style>
