<template>
    <div class="profile-page">
        <el-container>
            <el-header class="top-nav">
                <div class="nav-left">
                    <img src="/img/logo.png" alt="Logo" class="logo" />
                </div>
                <div class="nav-right">
                    <el-menu
                        :default-active="activeMenu"
                        class="nav-menu"
                        mode="horizontal"
                        :ellipsis="false"
                        @select="handleMenuSelect">
                        <el-menu-item index="abroad" class="main-menu-item">留学中心</el-menu-item>
                        <el-menu-item index="exam" class="main-menu-item">模考中心</el-menu-item>
                        <el-menu-item index="schedule" class="main-menu-item">排课中心</el-menu-item>
                        <el-sub-menu index="info">
                            <template #title><el-avatar :size="36" :src="userInfo.avatar" /></template>
                            <!-- 移动端菜单项 -->
                            <el-menu-item
                                index="mobile-abroad"
                                class="mobile-menu-item"
                                @click="handleMenuSelect('abroad')">
                                <el-icon><School /></el-icon>
                                留学中心
                            </el-menu-item>
                            <el-menu-item
                                index="mobile-exam"
                                class="mobile-menu-item"
                                @click="handleMenuSelect('exam')">
                                <el-icon><Document /></el-icon>
                                模考中心
                            </el-menu-item>
                            <el-menu-item
                                index="mobile-schedule"
                                class="mobile-menu-item"
                                @click="handleMenuSelect('schedule')">
                                <el-icon><Calendar /></el-icon>
                                排课中心
                            </el-menu-item>
                            <el-menu-item index="logout" @click="handleLogout">
                                <el-icon><SwitchButton /></el-icon>
                                退出登录
                            </el-menu-item>
                        </el-sub-menu>
                    </el-menu>
                </div>
            </el-header>
            <el-main class="main-content">
                <el-row :gutter="24" class="full-width" style="margin: 0">
                    <el-col :span="24" :lg="18">
                        <!-- 左侧内容区 主体业务-->
                        <el-card class="content-left">
                            <div class="content-left-body">
                                <!-- 动态左侧内容组件 -->
                                <component :is="leftComponent" />
                            </div>
                        </el-card>
                    </el-col>

                    <el-col :span="24" :lg="6" class="content-right">
                        <!-- 用户信息卡片 -->
                        <el-card class="user-info-card" shadow="hover">
                            <div class="user-avatar">
                                <el-avatar :size="60" :src="userInfo.avatar" />
                            </div>
                            <div class="user-details">
                                <h3>{{ userInfo.nickname }}</h3>
                                <p class="user-subtitle">{{ userInfo.school }} / {{ userInfo.grade }}</p>
                            </div>
                        </el-card>

                        <!-- 动态右侧内容组件 -->
                        <div class="content-right-body">
                            <component :is="rightComponent" />
                        </div>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";

// 导入子组件
import ExamLeftContent from "@/views/Profile/components/ExamLeftContent.vue";
import ExamRightContent from "@/views/Profile/components/ExamRightContent.vue";
import AbroadLeftContent from "@/views/Profile/components/AbroadLeftContent.vue";
import AbroadRightContent from "@/views/Profile/components/AbroadRightContent.vue";
import ScheduleLeftContent from "@/views/Profile/components/ScheduleLeftContent.vue";
import ScheduleRightContent from "@/views/Profile/components/ScheduleRightContent.vue";

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const activeMenu = ref("exam");

// 用户信息
const userInfo = computed(() => {
    return {
        avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
        nickname: authStore.userInfo?.nickname || "张同学",
        school: "北京大学",
        grade: "大三在读",
    };
});

// 组件映射配置
const componentMap: Record<string, any> = {
    abroad: {
        left: AbroadLeftContent,
        right: AbroadRightContent,
    },
    exam: {
        left: ExamLeftContent,
        right: ExamRightContent,
    },
    schedule: {
        left: ScheduleLeftContent,
        right: ScheduleRightContent,
    },
};

// 计算当前显示的组件
const leftComponent = computed(() => {
    return componentMap[activeMenu.value]?.left || ExamLeftContent;
});

const rightComponent = computed(() => {
    return componentMap[activeMenu.value]?.right || ExamRightContent;
});

// 方法
const handleMenuSelect = (key: string) => {
    // 更新当前激活的菜单项，组件会通过计算属性自动切换左右内容
    activeMenu.value = key;
};

const handleLogout = async () => {
    try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });

        await authStore.logout(router);
        ElMessage.success("退出成功");
    } catch {
        // 用户取消登出
    }
};
</script>

<style scoped lang="scss">
.profile-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    overflow-x: hidden;
    max-width: 100%;
}
.top-nav {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: relative;
    z-index: 100;

    .logo {
        height: 40px;
    }

    .nav-menu {
        border-bottom: none;
        background: transparent;
    }
    .nav-right {
        padding-right: 24px;
    }
}

.main-content {
    display: flex;
    padding: 1.75rem 1rem;

    .content-left {
        min-height: calc(100vh - 112px); // 减去header和padding

        :deep(.el-card__body) {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
    }

    .content-right {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .user-info-card {
            :deep(.el-card__body) {
                display: flex;
                align-items: center;
                justify-content: space-around;
                padding: 24px;
            }

            .user-details h3 {
                margin: 0 0 8px 0;
                color: #303133;
                font-size: 18px;
            }

            .user-subtitle {
                margin: 4px 0;
                color: #909399;
                font-size: 14px;
            }
        }
    }
}

// 自定义 el-tabs 样式以保持原有外观
.custom-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: 1px solid #e4e7ed;
        order: 0; // 确保 header 在顶部
        flex-shrink: 0;

        .el-tabs__nav-wrap {
            &::after {
                display: none; // 隐藏默认的底部边框
            }
        }

        .el-tabs__nav {
            display: flex;
        }

        .el-tabs__item {
            padding: 16px 24px;
            font-weight: 500;
            width: 150px;
            text-align: center;
            border-bottom: none;

            &.is-active {
                color: #409eff;
            }

            &:hover {
                color: #409eff;
            }
        }

        .el-tabs__active-bar {
            height: 3px;
            background: linear-gradient(90deg, #409eff, #67c23a);
            border-radius: 2px;
            bottom: 0;
        }
    }

    :deep(.el-tabs__content) {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        order: 1; // 确保内容在底部

        .el-tab-pane {
            height: 100%;
        }
    }
}

.exam-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.exam-card {
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
    }

    :deep(.el-card__header) {
        padding: 20px 20px 0 20px;

        h3 {
            margin: 0 0 16px 0;
            color: #303133;
        }
    }

    :deep(.el-card__body) {
        padding: 0 20px 20px 20px;
    }

    .card-body p {
        display: flex;
        align-items: center;
        margin: 8px 0;
        color: #606266;

        .el-icon {
            margin-right: 8px;
        }
    }

    .card-footer {
        margin-top: 20px;
        text-align: right;
    }
}

.assessment-card {
    :deep(.el-card__header) {
        h3 {
            margin: 0;
            color: #303133;
        }
    }

    .chart-container {
        height: 400px;
        margin-top: 20px;
    }

    .chart {
        height: 100%;
        width: 100%;
    }
}

.stats-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.stat-card {
    border: none;
    color: white;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    :deep(.el-card__body) {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .stat-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-content {
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
    }
}
.gradient-card {
    background: linear-gradient(135deg, #6374c1 0%, #764ba2 100%);
}

.gradient-card-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(245, 87, 108, 0.3);
    }
}

.gradient-card-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
    }
}

// 移动端适配
@media (max-width: 768px) {
    // 在768px以下仍显示主菜单项（平板端）
    .main-menu-item {
        display: flex !important;
    }

    .mobile-menu-item {
        display: none !important;
    }

    .profile-page {
        .top-nav {
            padding: 0 16px;

            .nav-right {
                padding-right: 0;
            }

            .nav-menu {
                :deep(.el-menu-item) {
                    padding: 0 8px;
                    font-size: 14px;
                }

                :deep(.el-sub-menu__title) {
                    padding: 0 8px;
                }
            }
        }

        .main-content {
            padding: 16px;

            .content-left {
                height: auto;
                margin-bottom: 16px;

                :deep(.el-card__body) {
                    height: auto;
                }
            }

            .content-right {
                gap: 16px;

                .user-info-card {
                    :deep(.el-card__body) {
                        flex-direction: column;
                        text-align: center;
                        padding: 20px;
                    }

                    .user-details {
                        margin-top: 12px;

                        h3 {
                            font-size: 16px;
                        }

                        .user-subtitle {
                            font-size: 13px;
                        }
                    }
                }
            }
        }
    }

    .custom-tabs {
        :deep(.el-tabs__header) {
            .el-tabs__nav-scroll {
                overflow-x: auto;

                &::-webkit-scrollbar {
                    height: 2px;
                }

                &::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                &::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 2px;
                }
            }

            .el-tabs__item {
                width: 120px;
                padding: 12px 16px;
                font-size: 14px;
                white-space: nowrap;
            }
        }

        :deep(.el-tabs__content) {
            padding: 16px;
        }
    }

    .exam-cards {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .exam-card {
        :deep(.el-card__header) {
            padding: 16px 16px 0 16px;

            h3 {
                font-size: 16px;
                margin-bottom: 12px;
            }
        }

        :deep(.el-card__body) {
            padding: 0 16px 16px 16px;
        }

        .card-body p {
            font-size: 14px;
            margin: 6px 0;
        }

        .card-footer {
            margin-top: 16px;
            text-align: center;

            .el-button {
                width: 100%;
            }
        }
    }

    .assessment-card {
        :deep(.el-card__header) {
            padding: 16px;

            h3 {
                font-size: 16px;
            }
        }

        :deep(.el-card__body) {
            padding: 16px;
        }

        .chart-container {
            height: 300px;
            margin-top: 16px;
        }
    }

    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }

    .stat-card {
        :deep(.el-card__body) {
            padding: 16px;
            gap: 12px;
        }

        .stat-icon {
            width: 40px;
            height: 40px;
        }

        .stat-content {
            .stat-number {
                font-size: 20px;
            }

            .stat-label {
                font-size: 13px;
            }
        }
    }

    // 表格移动端适配
    :deep(.el-table) {
        font-size: 14px;

        .el-table__header {
            th {
                padding: 8px 4px;
                font-size: 13px;
            }
        }

        .el-table__body {
            td {
                padding: 8px 4px;
                font-size: 13px;
            }
        }

        .el-table__cell {
            padding: 8px 4px;

            .el-button {
                padding: 4px 8px;
                font-size: 12px;
            }
        }
    }

    // 隐藏部分表格列在移动端
    :deep(.el-table) {
        .el-table-column--selection,
        .el-table__cell:nth-child(1) {
            display: none;
        }
    }
}

// 默认状态：显示主菜单项，隐藏移动端菜单项
.main-menu-item {
    display: flex !important;
}

.mobile-menu-item {
    display: none !important;
}

// 超小屏幕适配
@media (max-width: 480px) {
    // 隐藏主菜单项，显示移动端菜单项
    .main-menu-item {
        display: none !important;
    }

    .mobile-menu-item {
        display: flex !important;
    }

    .profile-page {
        .top-nav {
            padding: 0 12px;

            .logo {
                height: 32px;
            }

            .nav-menu {
                :deep(.el-menu-item) {
                    padding: 0 6px;
                    font-size: 13px;
                }

                // 子菜单样式优化
                :deep(.el-sub-menu) {
                    .el-sub-menu__title {
                        padding: 0 6px;
                    }

                    .el-menu-item {
                        padding-left: 20px;
                        font-size: 14px;

                        .el-icon {
                            margin-right: 8px;
                        }
                    }
                }
            }
        }

        .main-content {
            padding: 0.75rem;
        }
        .el-row {
            width: 100% !important;
            margin: 0 !important;

            :deep(.el-col) {
                margin: 0;
                padding: 0;
            }
        }
    }

    .custom-tabs {
        :deep(.el-tabs__header) {
            .el-tabs__item {
                width: 100px;
                padding: 10px 12px;
                font-size: 13px;
            }
        }

        :deep(.el-tabs__content) {
            padding: 12px;
        }
    }

    .stats-cards {
        grid-template-columns: 1fr;
    }

    .stat-card {
        :deep(.el-card__body) {
            padding: 12px;
            gap: 10px;
        }

        .stat-icon {
            width: 36px;
            height: 36px;
        }

        .stat-content {
            .stat-number {
                font-size: 18px;
            }

            .stat-label {
                font-size: 12px;
            }
        }
    }

    .assessment-card {
        .chart-container {
            height: 250px;
        }
    }

    // 表格在超小屏幕上进一步优化
    :deep(.el-table) {
        .el-table__header {
            th {
                padding: 6px 2px;
                font-size: 12px;
            }
        }

        .el-table__body {
            td {
                padding: 6px 2px;
                font-size: 12px;
            }
        }

        .el-table__cell {
            padding: 6px 2px;

            .el-button {
                padding: 2px 6px;
                font-size: 11px;
            }
        }
    }
}
</style>
