<template>
    <div class="abroad-service-container">
        <!-- 服务列表页面 -->
        <div v-if="!selectedService" class="service-list">
            <div class="page-header">
                <h2>我的留学服务</h2>
                <p>查看您的留学服务进度和详情</p>
            </div>
            
            <div class="service-cards">
                <el-card
                    v-for="service in services"
                    :key="service.id"
                    class="service-card"
                    shadow="hover"
                    @click="selectService(service)">
                    <div class="service-header">
                        <div class="service-title">
                            <h3>{{ service.name }}</h3>
                            <el-tag :type="getServiceStatusType(service.status)" size="small">
                                {{ service.status }}
                            </el-tag>
                        </div>
                        <div class="service-progress">
                            <el-progress
                                :percentage="service.progress"
                                :color="getProgressColor(service.progress)"
                                :stroke-width="6"
                                text-inside
                                :show-text="false"
                            />
                            <span class="progress-text">{{ service.progress }}%</span>
                        </div>
                    </div>
                    
                    <div class="service-info">
                        <div class="info-item">
                            <el-icon><Calendar /></el-icon>
                            <span>开始时间：{{ service.startDate }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon><Timer /></el-icon>
                            <span>完成时间：{{ service.estimatedEnd }}</span>
                        </div>
                        <div class="info-item">
                            <el-icon><User /></el-icon>
                            <span>服务学管：{{ service.teacher }}</span>
                        </div>
                    </div>
                    
                    <div class="service-stats">
                        <div class="stat-item">
                            <span class="stat-number">{{ service.completedTasks }}</span>
                            <span class="stat-label">已完成</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">{{ service.totalTasks }}</span>
                            <span class="stat-label">总任务</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">{{ service.pendingTasks }}</span>
                            <span class="stat-label">待完成</span>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- 服务详情页面 -->
        <div v-else class="service-detail">
            <div class="detail-header">
                <el-button
                    @click="selectedService = null"
                    :icon="ArrowLeft"
                    circle
                    size="large"
                    class="back-btn"
                />
                <div class="service-info-header">
                    <h2>{{ selectedService.name }}</h2>
                    <el-tag :type="getServiceStatusType(selectedService.status)">
                        {{ selectedService.status }}
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
                            :show-text="false"
                        />
                        <div class="progress-info">
                            <div class="info-row">
                                <span>已完成任务：</span>
                                <span class="highlight">{{ selectedService.completedTasks }}/{{ selectedService.totalTasks }}</span>
                            </div>
                            <div class="info-row">
                                <span>服务老师：</span>
                                <span>{{ selectedService.teacher }}</span>
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
                            <el-button type="text" @click="expandAll = !expandAll">
                                {{ expandAll ? '收起全部' : '展开全部' }}
                            </el-button>
                        </div>
                    </template>
                    
                    <div class="checklist-content">
                        <el-collapse v-model="activeCollapse" accordion>
                            <el-collapse-item
                                v-for="category in selectedService.checklist"
                                :key="category.id"
                                :name="category.id"
                                :title="category.title"
                                class="checklist-category">
                                <template #title>
                                    <div class="category-header">
                                        <span class="category-title">{{ category.title }}</span>
                                        <div class="category-progress">
                                            <el-progress
                                                :percentage="getCategoryProgress(category)"
                                                :color="getProgressColor(getCategoryProgress(category))"
                                                :stroke-width="4"
                                                :show-text="false"
                                                size="small"
                                            />
                                            <span class="category-progress-text">
                                                {{ getCompletedItemsCount(category) }}/{{ category.items.length }}
                                            </span>
                                        </div>
                                    </div>
                                </template>
                                
                                <div class="checklist-items">
                                    <div
                                        v-for="item in category.items"
                                        :key="item.id"
                                        class="checklist-item">
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
                                                        下载
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
                                                        v-model="item.teacherCompleted"
                                                        disabled
                                                        size="large">
                                                        <span class="checkbox-label">
                                                            老师确认
                                                            <el-icon class="info-icon">
                                                                <InfoFilled />
                                                            </el-icon>
                                                        </span>
                                                    </el-checkbox>
                                                    <div
                                                        v-if="item.teacherCompleted"
                                                        class="completion-info">
                                                        <span class="completion-time">{{ item.teacherCompletedTime }}</span>
                                                        <span class="completion-by">由 {{ item.teacherCompletedBy }} 确认</span>
                                                    </div>
                                                </div>
                                                
                                                <!-- 学生操作的复选框 -->
                                                <div class="checkbox-item student-checkbox">
                                                    <el-checkbox
                                                        v-model="item.studentCompleted"
                                                        :disabled="item.studentCompleted"
                                                        size="large"
                                                        @change="handleStudentCheck(item)">
                                                        <span class="checkbox-label">
                                                            学生确认
                                                            <el-icon class="confirm-icon">
                                                                <CircleCheck />
                                                            </el-icon>
                                                        </span>
                                                    </el-checkbox>
                                                    <div
                                                        v-if="item.studentCompleted"
                                                        class="completion-info">
                                                        <span class="completion-time">{{ item.studentCompletedTime }}</span>
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
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    Calendar,
    Timer,
    User,
    ArrowLeft,
    Download,
    InfoFilled,
    CircleCheck
} from '@element-plus/icons-vue';

// 定义接口
interface ChecklistItem {
    id: string;
    title: string;
    description?: string;
    teacherCompleted: boolean;
    teacherCompletedTime?: string;
    teacherCompletedBy?: string;
    studentCompleted: boolean;
    studentCompletedTime?: string;
    downloadUrl?: string;
}

interface ChecklistCategory {
    id: string;
    title: string;
    items: ChecklistItem[];
}

interface Service {
    id: number;
    name: string;
    status: string;
    progress: number;
    startDate: string;
    estimatedEnd: string;
    teacher: string;
    completedTasks: number;
    totalTasks: number;
    pendingTasks: number;
    checklist: ChecklistCategory[];
}

// 响应式数据
const selectedService = ref<Service | null>(null);
const activeCollapse = ref<string[]>([]);
const expandAll = ref(false);

// 服务列表数据
const services = ref<Service[]>([
    {
        id: 1,
        name: '美国本科申请全程服务',
        status: '进行中',
        progress: 65,
        startDate: '2024-01-15',
        estimatedEnd: '2024-08-30',
        teacher: '李老师',
        completedTasks: 13,
        totalTasks: 20,
        pendingTasks: 7,
        checklist: [
            {
                id: 'academic',
                title: '学术准备',
                items: [
                    {
                        id: 'transcript',
                        title: '成绩单认证',
                        description: '准备并认证高中成绩单',
                        teacherCompleted: true,
                        teacherCompletedTime: '2024-01-20 14:30',
                        teacherCompletedBy: '李老师',
                        studentCompleted: true,
                        studentCompletedTime: '2024-01-22 09:15',
                        downloadUrl: '/files/transcript-guide.pdf'
                    },
                    {
                        id: 'standardized-test',
                        title: '标准化考试',
                        description: 'SAT/ACT考试准备和成绩提交',
                        teacherCompleted: true,
                        teacherCompletedTime: '2024-02-01 16:00',
                        teacherCompletedBy: '李老师',
                        studentCompleted: false,
                        downloadUrl: '/files/test-prep-guide.pdf'
                    },
                    {
                        id: 'language-test',
                        title: '语言考试',
                        description: 'TOEFL/IELTS考试准备',
                        teacherCompleted: false,
                        studentCompleted: false,
                        downloadUrl: '/files/language-test-guide.pdf'
                    }
                ]
            },
            {
                id: 'application',
                title: '申请材料',
                items: [
                    {
                        id: 'personal-statement',
                        title: '个人陈述',
                        description: '撰写个人陈述和申请文书',
                        teacherCompleted: true,
                        teacherCompletedTime: '2024-02-15 10:30',
                        teacherCompletedBy: '李老师',
                        studentCompleted: false,
                        downloadUrl: '/files/ps-template.pdf'
                    },
                    {
                        id: 'recommendation',
                        title: '推荐信',
                        description: '获取推荐信',
                        teacherCompleted: false,
                        studentCompleted: false
                    },
                    {
                        id: 'portfolio',
                        title: '作品集',
                        description: '准备专业作品集（如适用）',
                        teacherCompleted: false,
                        studentCompleted: false
                    }
                ]
            },
            {
                id: 'visa',
                title: '签证申请',
                items: [
                    {
                        id: 'visa-form',
                        title: '签证表格',
                        description: '填写DS-160表格',
                        teacherCompleted: false,
                        studentCompleted: false,
                        downloadUrl: '/files/visa-guide.pdf'
                    },
                    {
                        id: 'visa-interview',
                        title: '签证面试',
                        description: '参加签证面试',
                        teacherCompleted: false,
                        studentCompleted: false
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        name: '英国硕士申请服务',
        status: '已完成',
        progress: 100,
        startDate: '2023-09-01',
        estimatedEnd: '2024-03-31',
        teacher: '王老师',
        completedTasks: 15,
        totalTasks: 15,
        pendingTasks: 0,
        checklist: [
            {
                id: 'preparation',
                title: '前期准备',
                items: [
                    {
                        id: 'university-selection',
                        title: '院校选择',
                        description: '选择合适的大学和专业',
                        teacherCompleted: true,
                        teacherCompletedTime: '2023-09-15 11:00',
                        teacherCompletedBy: '王老师',
                        studentCompleted: true,
                        studentCompletedTime: '2023-09-20 15:30'
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        name: '加拿大本科申请服务',
        status: '待开始',
        progress: 0,
        startDate: '2024-03-01',
        estimatedEnd: '2024-12-31',
        teacher: '张老师',
        completedTasks: 0,
        totalTasks: 18,
        pendingTasks: 18,
        checklist: [
            {
                id: 'initial',
                title: '初步准备',
                items: [
                    {
                        id: 'consultation',
                        title: '初步咨询',
                        description: '了解申请流程和要求',
                        teacherCompleted: false,
                        studentCompleted: false
                    }
                ]
            }
        ]
    }
]);

// 计算属性和方法
const getServiceStatusType = (status: string) => {
    switch (status) {
        case '进行中':
            return 'warning';
        case '已完成':
            return 'success';
        case '待开始':
            return 'info';
        default:
            return 'info';
    }
};

const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#67c23a';
    if (progress >= 50) return '#e6a23c';
    return '#409eff';
};

const getCategoryProgress = (category: ChecklistCategory) => {
    const completedItems = category.items.filter(item => 
        item.teacherCompleted && item.studentCompleted
    ).length;
    return category.items.length > 0 ? Math.round((completedItems / category.items.length) * 100) : 0;
};

const getCompletedItemsCount = (category: ChecklistCategory) => {
    return category.items.filter(item => 
        item.teacherCompleted && item.studentCompleted
    ).length;
};

const selectService = (service: Service) => {
    selectedService.value = service;
    activeCollapse.value = [];
};

const handleStudentCheck = async (item: ChecklistItem) => {
    if (item.studentCompleted) {
        try {
            await ElMessageBox.confirm(
                '确认完成此任务吗？确认后将无法修改。',
                '确认操作',
                {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                }
            );
            
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 设置完成时间
            item.studentCompletedTime = new Date().toLocaleString();
            
            // 更新服务进度
            updateServiceProgress();
            
            ElMessage.success('任务确认成功');
        } catch {
            // 用户取消，恢复checkbox状态
            item.studentCompleted = false;
        }
    }
};

const updateServiceProgress = () => {
    if (selectedService.value) {
        const allItems = selectedService.value.checklist.flatMap(category => category.items);
        const completedItems = allItems.filter(item => 
            item.teacherCompleted && item.studentCompleted
        ).length;
        
        selectedService.value.progress = allItems.length > 0 
            ? Math.round((completedItems / allItems.length) * 100) 
            : 0;
        selectedService.value.completedTasks = completedItems;
        selectedService.value.pendingTasks = allItems.length - completedItems;
    }
};

const downloadFile = (item: ChecklistItem) => {
    ElMessage.info(`正在下载：${item.title}`);
    // 实际项目中这里应该是真实的下载逻辑
    window.open(item.downloadUrl, '_blank');
};

// 监听展开全部状态
watch(expandAll, (newVal) => {
    if (selectedService.value) {
        activeCollapse.value = newVal 
            ? selectedService.value.checklist.map(cat => cat.id)
            : [];
    }
});
</script>

<style scoped lang="scss">
.abroad-service-container {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

// 服务列表样式
.service-list {
    .page-header {
        margin-bottom: 32px;
        
        h2 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 28px;
            font-weight: 600;
        }
        
        p {
            margin: 0;
            color: #909399;
            font-size: 16px;
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
        border: 1px solid #e4e7ed;
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #409eff;
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
                    font-size: 20px;
                    font-weight: 600;
                    color: #303133;
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
                    color: #409eff;
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
                color: #606266;
                font-size: 14px;
                
                .el-icon {
                    color: #909399;
                }
            }
        }
        
        .service-stats {
            display: flex;
            justify-content: space-between;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            
            .stat-item {
                text-align: center;
                
                .stat-number {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: #409eff;
                    margin-bottom: 4px;
                }
                
                .stat-label {
                    font-size: 12px;
                    color: #909399;
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
            color: #409eff;
            border-color: #409eff;
            
            &:hover {
                background: #409eff;
                color: white;
            }
        }
        
        .service-info-header {
            display: flex;
            align-items: center;
            gap: 12px;
            
            h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #303133;
            }
        }
    }
    
    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .progress-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .progress-percentage {
                font-size: 18px;
                font-weight: 600;
                color: #409eff;
            }
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
                    color: #606266;
                    
                    .highlight {
                        color: #409eff;
                        font-weight: 600;
                    }
                }
            }
        }
    }
    
    .checklist-card {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .checklist-content {
            :deep(.el-collapse) {
                border: none;
                
                .el-collapse-item {
                    border-bottom: 1px solid #e4e7ed;
                    
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
                    font-size: 18px;
                    font-weight: 600;
                    color: #303133;
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
                        color: #606266;
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
                background: #fafbfc;
                border-radius: 8px;
                border: 1px solid #e4e7ed;
                
                .item-content {
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        
                        .item-title {
                            font-size: 16px;
                            font-weight: 600;
                            color: #303133;
                        }
                        
                        .item-actions {
                            display: flex;
                            gap: 8px;
                        }
                    }
                    
                    .item-description {
                        margin-bottom: 16px;
                        color: #606266;
                        font-size: 14px;
                        line-height: 1.5;
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
                                
                                .info-icon {
                                    color: #909399;
                                }
                                
                                .confirm-icon {
                                    color: #67c23a;
                                }
                            }
                            
                            .completion-info {
                                margin-left: 24px;
                                display: flex;
                                flex-direction: column;
                                gap: 2px;
                                
                                .completion-time {
                                    font-size: 12px;
                                    color: #909399;
                                }
                                
                                .completion-by {
                                    font-size: 12px;
                                    color: #67c23a;
                                    font-weight: 500;
                                }
                            }
                            
                            &.teacher-checkbox {
                                :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                                    background-color: #409eff;
                                    border-color: #409eff;
                                }
                            }
                            
                            &.student-checkbox {
                                :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
                                    background-color: #67c23a;
                                    border-color: #67c23a;
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
                    font-size: 20px !important;
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
                    font-size: 20px !important;
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
}
</style>