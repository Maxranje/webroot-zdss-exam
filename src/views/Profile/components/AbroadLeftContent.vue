<template>
    <div class="abroad-service-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
                <Loading />
            </el-icon>
            <p>正在加载留学服务...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!abroadplans.length" class="empty-state">
            <div class="empty-icon">
                <el-icon>
                    <Document />
                </el-icon>
            </div>
            <h3>暂无留学服务</h3>
            <p>您还没有任何留学服务记录</p>
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>

        <!-- 服务列表页面 -->
        <div v-else-if="!selectedService" class="service-list">
            <div class="page-header">
                <h2>我的留学服务</h2>
                <p>查看您的留学服务进度和详情</p>
            </div>

            <div class="service-cards">
                <el-card
                    v-for="abroadplan in abroadplans"
                    :key="abroadplan.id"
                    class="service-card"
                    shadow="hover"
                    @click="selectService(abroadplan)">
                    <div class="service-header">
                        <div class="service-title">
                            <h3>{{ abroadplan.name }}</h3>
                            <el-tag :type="getServiceStatusType(abroadplan.status)" size="small">
                                {{ getServiceStatusName(abroadplan.status) }}
                            </el-tag>
                        </div>
                        <div class="service-progress">
                            <el-progress
                                :percentage="abroadplan.progress"
                                :color="getProgressColor(abroadplan.progress)"
                                :stroke-width="6"
                                text-inside
                                :show-text="false" />
                            <span class="progress-text">{{ abroadplan.progress }}%</span>
                        </div>
                    </div>

                    <div class="service-info">
                        <div class="info-item">
                            <el-icon><User /></el-icon>
                            <span>服务学管：{{ abroadplan.operator }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon><Calendar /></el-icon>
                            <span>开始时间：{{ abroadplan.startDate }}</span>
                        </div>
                    </div>

                    <div class="service-stats">
                        <div class="stat-item">
                            <span class="stat-number">{{ abroadplan.completedTasks }}</span>
                            <span class="stat-label">已核对项</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">{{ abroadplan.totalTasks }}</span>
                            <span class="stat-label">总检查项</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">{{ abroadplan.pendingTasks }}</span>
                            <span class="stat-label">待核对项</span>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 服务详情页面 -->
        <div v-else class="service-detail">
            <div v-if="!selectedService.name" class="error-state">
                <el-alert
                    title="数据错误"
                    description="服务数据不完整，请刷新页面重试"
                    type="error"
                    show-icon
                    :closable="false" />
            </div>
            <div class="detail-header">
                <el-button @click="selectedService = null" :icon="ArrowLeft" circle size="large" class="back-btn" />
                <div class="service-info-header">
                    <h2>{{ selectedService.name || "未知服务" }}</h2>
                    <el-tag :type="getServiceStatusType(selectedService.status)">
                        {{ getServiceStatusName(selectedService.status) }}
                    </el-tag>
                </div>
            </div>

            <div class="detail-content">
                <!-- 进度概览 -->
                <el-card class="progress-card" shadow="never">
                    <template #header>
                        <div class="card-header">
                            <span>服务进度</span>
                            <span class="progress-percentage">{{ selectedService.progress }}%</span>
                        </div>
                    </template>

                    <div class="progress-detail">
                        <el-progress
                            :percentage="selectedService.progress"
                            :color="getProgressColor(selectedService.progress)"
                            :stroke-width="8"
                            :show-text="false" />
                        <div class="progress-info">
                            <div class="info-row">
                                <span>已完成任务：</span>
                                <span class="highlight">
                                    {{ selectedService.completedTasks }}/{{ selectedService.totalTasks }}
                                </span>
                            </div>
                            <div class="info-row">
                                <span>服务老师：</span>
                                <span>{{ selectedService.operator }}</span>
                            </div>
                            <div class="info-row">
                                <span>开始时间：</span>
                                <span>{{ selectedService.startDate }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- 任务清单 -->
                <el-card class="checklist-card" shadow="never">
                    <template #header>
                        <div class="card-header">
                            <span>任务清单</span>
                            <el-button
                                class="expand-all-btn"
                                link
                                @click="toggleExpandAll"
                                :icon="!expandAll ? TurnOff : Open" />
                        </div>
                    </template>

                    <div class="checklist-content">
                        <div v-if="!hasChecklist" class="empty-checklist">
                            <p>暂无任务清单数据</p>
                        </div>

                        <el-collapse v-else v-model="activeCollapse" accordion>
                            <el-collapse-item
                                :icon="CaretRight"
                                v-for="category in selectedService.checklist"
                                :name="category.id"
                                :title="category.title"
                                class="checklist-category">
                                <template #title>
                                    <div class="category-header">
                                        <span class="category-title">{{ category.title }}</span>
                                        <div class="category-progress">
                                            <span class="category-progress-text">
                                                {{ getCompletedItemsProgress(category) }}
                                            </span>
                                        </div>
                                    </div>
                                </template>

                                <div class="checklist-items">
                                    <div v-for="item in category.items || []" :key="item.key" class="checklist-item">
                                        <div class="item-content">
                                            <div class="item-header">
                                                <span class="item-title">{{ item.title }}</span>
                                                <div class="item-actions">
                                                    <el-button
                                                        v-if="item.downloadUrl"
                                                        type="primary"
                                                        size="small"
                                                        text
                                                        @click="downloadFile(item)"
                                                        :icon="Download">
                                                        下载附件
                                                    </el-button>
                                                </div>
                                            </div>

                                            <div class="item-description" v-if="item.description">
                                                {{ item.description }}
                                            </div>

                                            <div class="item-checkboxes">
                                                <!-- 老师操作的复选框 -->
                                                <div class="checkbox-item teacher-checkbox">
                                                    <el-checkbox
                                                        :model-value="item.teacherCompleted == 1"
                                                        disabled
                                                        size="large">
                                                        <span class="checkbox-label">
                                                            老师确认
                                                            <el-icon class="info-icon">
                                                                <InfoFilled />
                                                            </el-icon>
                                                        </span>
                                                    </el-checkbox>
                                                    <div v-if="item.teacherCompleted == 1" class="completion-info">
                                                        <span class="completion-time">
                                                            {{ item.teacherCompletedTime }}
                                                        </span>
                                                        <span class="completion-by">
                                                            由 {{ item.teacherCompletedBy }} 确认
                                                        </span>
                                                    </div>
                                                </div>

                                                <!-- 学生操作的复选框 -->
                                                <div class="checkbox-item student-checkbox">
                                                    <el-checkbox
                                                        :model-value="item.studentCompleted == 1"
                                                        :disabled="
                                                            item.studentCompleted == 1 ||
                                                            (selectedService.status != 1 && selectedService.status != 4)
                                                        "
                                                        size="large"
                                                        @change="handleStudentCheck(selectedService, item)">
                                                        <span class="checkbox-label">
                                                            学生确认
                                                            <el-icon class="confirm-icon">
                                                                <CircleCheck />
                                                            </el-icon>
                                                        </span>
                                                    </el-checkbox>
                                                    <div v-if="item.studentCompleted == 1" class="completion-info">
                                                        <span class="completion-time">
                                                            {{ item.studentCompletedTime }}
                                                        </span>
                                                        <span class="completion-by">双方确认完成</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, inject } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CaretRight, Grid, Open, Operation, TurnOff } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import {
    Calendar,
    User,
    ArrowLeft,
    Download,
    InfoFilled,
    CircleCheck,
    Loading,
    Document,
} from "@element-plus/icons-vue";

// 定义接口
interface ChecklistItem {
    key: string;
    title: string;
    description?: string;
    teacherCompleted: number;
    teacherCompletedTime?: string;
    teacherCompletedBy?: string;
    studentCompleted: number;
    studentCompletedTime?: string;
    downloadUrl?: string;
}

interface ChecklistCategory {
    id: number;
    title: string;
    items: ChecklistItem[];
}

interface Service {
    id: number;
    name: string;
    status: number;
    progress: number;
    startDate: string;
    operator: string;
    completedTasks: number;
    totalTasks: number;
    pendingTasks: number;
    checklist: ChecklistCategory[];
}

// 状态映射常量
const STATUS_CONFIG = {
    1: { type: "info", name: "进行中" },
    2: { type: "success", name: "已完成" },
    3: { type: "warning", name: "已结转" },
    4: { type: "info", name: "进行中" },
} as const;

// 使用 auth store
const authStore = useAuthStore();

// 注入父组件提供的刷新方法
const refreshRightContent = inject("refreshRightContent") as (() => Promise<void>) | undefined;

// 响应式数据
const selectedService = ref<Service | null>(null);
const activeCollapse = ref<number[]>([]);
const expandAll = ref(false);
const loading = ref(false);
const abroadplans = ref<Service[]>([]);

// 计算属性
const hasChecklist = computed(() => {
    console.log(selectedService.value?.checklist);
    return Boolean(selectedService.value?.checklist?.length);
});

// 获取留学服务列表
const fetchAbroadPlans = async () => {
    loading.value = true;
    try {
        const response = await authStore.fetchAuthReq("/napi/abroadplan/lists", "GET");
        if (response.status === 0) {
            abroadplans.value = response.data.list || [];
        } else {
            ElMessage.error(response.msg || "获取留学服务列表失败");
        }
    } catch (error) {
        abroadplans.value = [];
        ElMessage.error("获取留学服务列表失败");
    } finally {
        loading.value = false;
    }
};

// 刷新数据
const refreshData = () => {
    fetchAbroadPlans();
};

// 工具方法
const getServiceStatusType = (status: number) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.type || "info";
};

const getServiceStatusName = (status: number) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.name || "进行中";
};

const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#67c23a";
    if (progress >= 50) return "#e6a23c";
    return "#409eff";
};

const getCategoryProgress = (category: ChecklistCategory) => {
    if (!category?.items?.length) return 0;
    const completedItems = category.items.filter(
        item => item.teacherCompleted == 1 && item.studentCompleted == 1
    ).length;
    return Math.round((completedItems / category.items.length) * 100);
};

const getCompletedItemsProgress = (category: ChecklistCategory) => {
    if (!category?.items?.length) return "0%";
    return (
        Math.round(
            (category.items.filter(item => item.teacherCompleted == 1 && item.studentCompleted == 1).length /
                category.items.length) *
                100
        ) + "%"
    );
};

const selectService = (service: Service) => {
    selectedService.value = service;
    activeCollapse.value = [];
};

const handleStudentCheck = async (service: Service, item: ChecklistItem) => {
    if (item.studentCompleted == 1) {
        return; // 已经确认过，不允许重复操作
    }
    if (service.status != 1 && service.status != 4) {
        ElMessage.error("非有效状态，无法确认");
        return;
    }

    // 检查 key 是否存在
    if (!item.key || !service.id) {
        ElMessage.error("任务标识缺失，无法确认");
        return;
    }

    try {
        await ElMessageBox.confirm("确认完成此任务吗？确认后将无法修改。", "确认操作", {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
        });

        // 调用真实的 API
        const result = await authStore.fetchAuthReq("/napi/abroadplan/check", "POST", {
            key: item.key,
            service_id: service.id,
        });

        if (result.status === 0) {
            // 更新本地状态
            item.studentCompletedTime = new Date().toLocaleString();
            item.studentCompleted = 1;
            updateServiceProgress();
            ElMessage.success("确认成功");

            // 刷新右侧组件的 summary 数据
            if (refreshRightContent) {
                await refreshRightContent();
            }
        } else {
            ElMessage.error(result.msg || "任务确认失败");
        }
    } catch (error) {
        if (error === "cancel") {
            // 用户取消操作，不需要显示错误信息
            return;
        }
        console.error("任务确认失败:", error);
        ElMessage.error("任务确认失败，请重试");
    }
};

const updateServiceProgress = () => {
    if (!selectedService.value?.checklist) return;

    const allItems = selectedService.value.checklist
        .filter(category => category?.items?.length)
        .flatMap(category => category.items);
    const completedItems = allItems.filter(item => item.teacherCompleted == 1 && item.studentCompleted == 1).length;

    selectedService.value.progress = allItems.length > 0 ? Math.round((completedItems / allItems.length) * 100) : 0;
    selectedService.value.completedTasks = completedItems;
    selectedService.value.pendingTasks = allItems.length - completedItems;
};

const downloadFile = (item: ChecklistItem) => {
    if (!item.downloadUrl) {
        ElMessage.warning("下载链接不可用");
        return;
    }
    ElMessage.info(`正在下载：${item.title}`);
    window.open(item.downloadUrl, "_blank");
};

const toggleExpandAll = () => {
    expandAll.value = !expandAll.value;
    if (selectedService.value?.checklist?.length) {
        activeCollapse.value = expandAll.value ? selectedService.value.checklist.map(cat => cat.id) : [];
        console.log(activeCollapse.value);
    } else {
        activeCollapse.value = [];
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchAbroadPlans();
});
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #e4e7ed;
$bg-light: #f8f9fa;
$bg-lighter: #fafbfc;

.abroad-service-container {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

// 通用样式
.loading-container,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.loading-container {
    height: 300px;
    color: $text-regular;

    .loading-icon {
        font-size: 48px;
        color: $primary-color;
        margin-bottom: 16px;
        animation: spin 1s linear infinite;
    }

    p {
        font-size: 15px;
        margin: 0;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.error-state {
    margin-bottom: 20px;
}

.empty-state {
    height: 400px;

    .empty-icon {
        width: 120px;
        height: 120px;
        margin-bottom: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
            font-size: 48px;
            color: #c0c4cc;
        }
    }

    h3 {
        margin: 0 0 12px 0;
        font-size: 22px;
        color: $text-primary;
        font-weight: 600;
    }

    p {
        margin: 0 0 32px 0;
        color: $text-secondary;
        font-size: 15px;
        line-height: 1.5;
    }

    .el-button {
        padding: 12px 24px;
        font-size: 15px;
    }
}

// 服务列表样式
.service-list {
    .page-header {
        margin-bottom: 32px;

        h2 {
            margin: 0 0 8px 0;
            color: $text-primary;
            font-size: 24px;
            font-weight: 600;
        }

        p {
            margin: 0;
            color: $text-secondary;
            font-size: 15px;
        }
    }

    .service-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 24px;
    }

    .service-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid $border-color;

        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: $primary-color;
        }

        :deep(.el-card__body) {
            padding: 24px;
        }

        .service-header {
            margin-bottom: 20px;

            .service-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;

                h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: $text-primary;
                }
            }

            .service-progress {
                display: flex;
                align-items: center;
                gap: 12px;

                .el-progress {
                    flex: 1;
                }

                .progress-text {
                    font-weight: 600;
                    color: $primary-color;
                }
            }
        }

        .service-info {
            margin-bottom: 20px;

            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                color: $text-regular;
                font-size: 14px;

                .el-icon {
                    color: $text-secondary;
                }
            }
        }

        .service-stats {
            display: flex;
            justify-content: space-between;
            padding: 16px;
            background: $bg-light;
            border-radius: 8px;

            .stat-item {
                text-align: center;

                .stat-number {
                    display: block;
                    font-size: 22px;
                    font-weight: 700;
                    color: $primary-color;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 13px;
                    color: $text-secondary;
                }
            }
        }
    }
}

// 服务详情样式
.service-detail {
    .detail-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        .back-btn {
            color: $primary-color;
            border-color: $primary-color;

            &:hover {
                background: $primary-color;
                color: white;
            }
        }

        .service-info-header {
            display: flex;
            align-items: center;
            gap: 12px;

            h2 {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
                color: $text-primary;
            }
        }
    }

    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .progress-card,
    .checklist-card {
        .card-header {
            font-weight: 600;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .expand-all-btn {
            font-size: 20px;
        }
    }

    .progress-card {
        .progress-percentage {
            font-size: 16px;
            font-weight: 600;
            color: $primary-color;
        }

        .progress-detail {
            .el-progress {
                margin-bottom: 16px;
            }

            .progress-info {
                display: flex;
                flex-direction: column;
                gap: 8px;

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    color: $text-regular;
                    font-size: 14px;

                    .highlight {
                        color: $primary-color;
                        font-weight: 600;
                    }
                }
            }
        }
    }

    .checklist-card {
        .checklist-content {
            .empty-checklist {
                text-align: center;
                padding: 40px 20px;
                color: $text-secondary;

                p {
                    margin: 8px 0;
                    font-size: 14px;
                }
            }

            :deep(.el-collapse) {
                border: none;

                .el-collapse-item {
                    border-bottom: 1px solid $border-color;

                    &:last-child {
                        border-bottom: none;
                    }

                    .el-collapse-item__header {
                        padding: 16px 0;
                        border: none;
                        background: transparent;
                    }

                    .el-collapse-item__content {
                        padding: 0 0 16px 0;
                        border: none;
                        background: transparent;
                    }
                }
            }

            .category-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;

                .category-title {
                    font-size: 14px;
                    color: $text-primary;
                }

                .category-progress {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .el-progress {
                        width: 100px;
                    }

                    .category-progress-text {
                        font-size: 14px;
                        color: $text-regular;
                        font-weight: 500;
                    }
                }
            }

            .checklist-items {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .checklist-item {
                padding: 20px;
                background: $bg-lighter;
                border-radius: 8px;
                border: 1px solid $border-color;

                .item-content {
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;

                        .item-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: $text-primary;
                        }

                        .item-actions {
                            display: flex;
                            gap: 8px;
                        }
                    }

                    .item-description {
                        margin-bottom: 16px;
                        color: $text-regular;
                        font-size: 13px;
                        line-height: 1.6;
                    }

                    .item-checkboxes {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;

                        .checkbox-item {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;

                            .checkbox-label {
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-weight: 500;
                                font-size: 13px;

                                .info-icon {
                                    color: $text-secondary;
                                }

                                .confirm-icon {
                                    color: $success-color;
                                }
                            }

                            .completion-info {
                                margin-left: 24px;
                                display: flex;
                                flex-direction: column;
                                gap: 2px;

                                .completion-time {
                                    font-size: 13px;
                                    color: $text-secondary;
                                }

                                .completion-by {
                                    font-size: 13px;
                                    color: $success-color;
                                    font-weight: 500;
                                }
                            }

                            &.teacher-checkbox {
                                :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                                    background-color: $primary-color;
                                    border-color: $primary-color;
                                }
                            }

                            &.student-checkbox {
                                :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                                    background-color: $success-color;
                                    border-color: $success-color;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .abroad-service-container {
        padding: 16px;
    }

    .service-cards {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
    }

    .service-card {
        :deep(.el-card__body) {
            padding: 16px !important;
        }

        .service-header {
            margin-bottom: 16px !important;

            .service-title {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 8px;
            }
        }

        .service-stats {
            padding: 12px !important;

            .stat-item {
                .stat-number {
                    font-size: 18px !important;
                }
            }
        }
    }

    .service-detail {
        .detail-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px !important;

            .service-info-header {
                h2 {
                    font-size: 18px !important;
                }
            }
        }

        .checklist-item {
            padding: 16px !important;

            .item-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 8px !important;
            }

            .item-checkboxes {
                gap: 8px !important;
            }
        }
    }

    .empty-state {
        height: 300px !important;

        .empty-icon {
            width: 80px !important;
            height: 80px !important;
            margin-bottom: 16px !important;

            .el-icon {
                font-size: 32px !important;
            }
        }

        h3 {
            font-size: 18px !important;
        }

        p {
            font-size: 14px !important;
        }
    }
}
</style>
