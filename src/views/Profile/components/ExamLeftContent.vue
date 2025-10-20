<template>
    <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 历史考试记录 -->
        <el-tab-pane label="历史考试记录" name="history">
            <div class="history-pane-content">
                <el-table :data="paginatedHistory" style="width: 100%" height="100%">
                    <el-table-column prop="indentify" label="考试编号" width="180" align="center" />
                    <el-table-column prop="paperName" label="试卷名称" align="center">
                        <template #default="scope">
                            <div class="paper-name">
                                {{ scope.row.paperName }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="studentStartTimeText" label="考试时间" width="120" align="center" />
                    <el-table-column prop="studentSpendTimeText" label="用时" width="100" align="center">
                        <template #default="row">
                            <el-tag type="warning">
                                {{ row.row.studentSpendTimeText }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="studentStatusText" label="考试状态" width="80" align="center">
                        <template #default="scope">
                            <el-tag :type="getStatusTagType(scope.row.studentStatus)">
                                {{ scope.row.studentStatusText }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="studentScore" label="分数" width="80" align="center">
                        <template #default="scope">
                            <el-tag
                                type="success"
                                v-if="scope.row.studentScore !== null && scope.row.studentStatus === 8">
                                {{ scope.row.studentScore }}
                            </el-tag>
                            <el-tag type="info" v-else>--</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100" align="center">
                        <template #default="scope">
                            <el-button
                                v-if="canViewReport(scope.row.studentStatus)"
                                size="small"
                                type="primary"
                                @click="viewReport(scope.row)">
                                查看报告
                            </el-button>
                            <el-button v-else size="small" disabled @click="showNoReportTip">查看报告</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20]"
                    :total="totalItems"
                    layout="total, sizes, prev, pager, next, jumper" />
            </div>
        </el-tab-pane>

        <!-- 待考试记录 -->
        <el-tab-pane label="待考试记录" name="pending">
            <div v-loading="loadingPending" class="exam-cards-container">
                <div v-if="examPending.length > 0" class="exam-cards">
                    <el-card
                        v-for="exam in examPending"
                        :key="exam.examId"
                        class="exam-card"
                        shadow="hover"
                        :style="{ backgroundImage: `url(${getRandomBackground()})` }">
                        <template #header>
                            <div class="exam-card-header">
                                <h3>{{ exam.paperName }}</h3>
                            </div>
                        </template>
                        <div class="card-body">
                            <p>
                                <el-icon><Calendar /></el-icon>
                                <span>考试时间：</span>
                                {{ exam.startEnd }}
                            </p>
                            <p>
                                <el-icon><Clock /></el-icon>
                                <span>考试时长：</span>
                                {{ exam.expireTimeText }}
                            </p>
                            <p>
                                <el-icon><User /></el-icon>
                                <span>监考老师：</span>
                                {{ exam.teacherName }}
                            </p>
                            <p>
                                <el-icon><Timer /></el-icon>
                                <span>剩余时间：</span>
                                <span class="remaining-time">{{ exam.lastTimeText }}</span>
                            </p>
                        </div>
                        <div class="card-footer">
                            <el-button type="primary" @click="startExam(exam)">开始考试</el-button>
                        </div>
                    </el-card>
                </div>
                <el-empty v-else description="暂无待考记录" />
            </div>
        </el-tab-pane>

        <!-- 能力评估 -->
        <el-tab-pane label="能力评估" name="assessment">
            <ExamAnalysis />
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { formatDurationTime, formatTime, formatDateTime } from "@/utils/tools";
import { ExamItem } from "@/types/exam";
import { Calendar, Clock, User, Timer } from "@element-plus/icons-vue";
import ExamAnalysis from "@/components/ExamAnalysis.vue";

interface ExamListItem extends ExamItem {
    startEnd: string;
    expireTimeText: string;
    lastTimeText: string;
    studentStartTime: number;
    studentEndTime: number;
    studentStartEnd: string;
    studentSpendTime: number;
    studentSpendTimeText: string;
    studentScore: number;
    studentStatus: number;
}

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const activeTab = ref("history");
const loadingPending = ref(false);

// 历史考试记录
const examHistory = ref<ExamListItem[]>([]);
// 进行中考试记录
const examPending = ref<ExamListItem[]>([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => examHistory.value.length);

// 计算当前页显示的数据
const paginatedHistory = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return examHistory.value.slice(start, end);
});

// 待考试记录
const getRandomBackground = () => {
    const bgNumber = Math.floor(Math.random() * 4) + 1;
    return `/img/exam-bg${bgNumber}.png`;
};

// 获取pending考试记录
const fetchPendingExams = async () => {
    loadingPending.value = true;
    try {
        const result = await authStore.fetchAuthReq("/mapi/napi/exam_lists", "GET");
        if (result.status === 0 && result.data) {
            // 分别设置待考和历史记录
            if (result.data.pending) {
                // 格式化每一项数据后放到examPending
                examPending.value = result.data.pending.map(formatExamItem);
            }
            if (result.data.history) {
                examHistory.value = result.data.history.map(formatExamItem);
            }
        } else {
            ElMessage.error(result.msg || "获取考试记录失败");
        }
    } catch (error) {
        console.error("获取待考记录失败:", error);
        ElMessage.error("获取待考记录失败");
    } finally {
        loadingPending.value = false;
    }
};

// 对exam数据格式化
const formatExamItem = (exam: ExamListItem) => {
    return {
        ...exam,
        startEnd: `${formatDateTime(exam.startTime)} 到 ${formatDateTime(exam.endTime)}`,
        expireTimeText: `${exam.expireTime / 60} 分钟`,
        lastTimeText: formatDurationTime(exam.lastTime, true),
        studentStartTimeText: `${formatCustomDateTime(exam.studentStartTime)}`,
        studentSpendTimeText: `${formatDurationTime(exam.studentSpendTime, true)}`,
        studentStatusText: `${formatStudentStatus(exam.studentStatus)}`,
        studentScore: exam.studentScore || 0,
        sign: exam.sign || "",
    };
};

const formatCustomDateTime = (seconds: number) => {
    if (!seconds) {
        return "--";
    }
    const date = new Date(seconds * 1000);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}月${day}日 ${hours.toString().padStart(2, "0")}时`;
};

// 结构化学员考试状态
const formatStudentStatus = (status: number) => {
    // 1 待开始, 2: 已交卷, 5:进行中, 4:被踢出, 7:批改中, 8:结束
    switch (status) {
        case 1:
            return "已到期";
        case 2:
            return "待批改";
        case 4:
            return "被踢出";
        case 7:
            return "批改中";
        case 8:
            return "已结束";
        default:
            return "未知";
    }
};

// 判断是否可以查看报告
const canViewReport = (status: number) => {
    // 2: 已交卷, 7:批改中, 8:结束 可以查看报告
    return [2, 7, 8].includes(status);
};

// 获取状态标签类型
const getStatusTagType = (status: number) => {
    switch (status) {
        case 1:
            return "danger";
        case 2:
            return "primary";
        case 4:
            return "warning";
        case 7:
            return "info";
        case 8:
            return "success";
    }
};

// 显示无法查看报告的提示
const showNoReportTip = () => {
    ElMessage.warning("当前考试状态无法查看报告");
};

const viewReport = (exam: any) => {
    // 保存考试信息到localStorage以便DetailView使用
    localStorage.setItem("examResult", JSON.stringify(exam));
    // 导航到详情页并传递examId参数, 跳转新页面
    // 生成完整URL并在新标签页中打开
    const url = router.resolve({ path: "/mock/detail", query: { examId: exam.examId } }).href;
    window.open(url, "_blank");
};

// 开始考试
const startExam = (exam: ExamItem) => {
    // 判断starttime 和 endTime 和当前时间是否在有效期内
    const currentTime = Date.now();
    if (currentTime < exam.startTime * 1000) {
        ElMessage.error("考试时间未到，不能开始考试");
        return;
    }
    if (currentTime > exam.endTime * 1000) {
        ElMessage.error("考试时间已过，不能进行考试, 联系监考老师");
        return;
    }
    localStorage.setItem("currentExam", JSON.stringify(exam));
    router.push("/mock");
};

onMounted(() => {
    fetchPendingExams();
});
</script>

<style scoped lang="scss">
// 自定义 el-tabs 样式
.custom-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: 1px solid #e4e7ed;
        order: 0;
        flex-shrink: 0;

        .el-tabs__nav-wrap {
            &::after {
                display: none;
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
        overflow: hidden; // 禁用此处的滚动
        order: 1;

        .el-tab-pane {
            height: 100%;
        }
    }
}

.history-pane-content {
    display: flex;
    flex-direction: column;
    height: 100%;

    .el-table {
        flex: 1;
        /* height="100%" in template will handle the scroll */

        :deep(.el-table__header-wrapper) {
            th {
                background-color: #f0f8ff !important;
                font-weight: 600;
                color: #2c3e50 !important;
                height: 50px;
            }
        }

        :deep(.el-table__row) {
            transition: all 0.3s ease;

            &:hover {
                background-color: #f5f9ff !important;
                transform: translateY(-2px);
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            }

            td {
                padding: 12px 0;
                height: 60px;
            }
        }

        :deep(.el-table__body-wrapper) {
            overflow-y: auto;
            overflow-x: hidden;
        }

        :deep(.el-button) {
            border-radius: 20px;
            transition: all 0.3s;

            &:hover {
                transform: scale(1.05);
            }

            &.is-disabled {
                background-color: #f5f7fa;
                color: #c0c4cc;
            }
        }

        .paper-name {
            color: #2c3e50;
            font-weight: 500;
            padding: 4px 0;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .el-pagination {
        flex-shrink: 0;
        padding: 20px 0;
        display: flex;
        justify-content: flex-end;

        :deep(.el-pagination__sizes) {
            margin-right: 15px;
        }

        :deep(.btn-prev),
        :deep(.btn-next),
        :deep(.el-pager li) {
            background: transparent;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            margin: 0 3px;

            &:hover {
                color: #409eff;
                border-color: #409eff;
            }
        }

        :deep(.el-pager li.active) {
            background-color: #409eff;
            color: white;
            border-color: #409eff;
        }
    }
}
.exam-cards-container {
    height: 100%;
    overflow-y: auto; // 为这个容器单独添加滚动
}

.exam-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 12px;
    margin: 0 auto;
}

.exam-card {
    position: relative;
    transition: all 0.3s ease;
    border: none;
    border-radius: 16px;
    overflow: hidden;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    min-height: 300px;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.15) 30%, rgba(0, 0, 0, 0.05) 100%);
        z-index: 1;
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    :deep(.el-card__header) {
        position: relative;
        z-index: 2;
        padding: 24px 24px 16px;
        border-bottom: none;
        background: transparent;

        .exam-card-header {
            h3 {
                margin: 0;
                color: white;
                font-size: 20px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                letter-spacing: 0.5px;
            }
        }
    }

    :deep(.el-card__body) {
        position: relative;
        z-index: 2;
        padding: 0 24px 24px;
    }

    .card-body {
        background: rgba(255, 255, 255, 0.5);
        padding: 16px;
        border-radius: 12px;
        backdrop-filter: blur(8px);

        p {
            display: flex;
            align-items: center;
            margin: 12px 0;
            color: #2c3e50;
            font-size: 14px;
            line-height: 1.6;

            .el-icon {
                margin-right: 12px;
                color: #409eff;
                font-size: 18px;
            }

            span {
                &:first-child {
                    color: #606266;
                    margin-right: 8px;
                    min-width: 70px;
                }
            }

            .remaining-time {
                color: #ff4d4f;
                font-weight: 600;
                background: rgba(255, 77, 79, 0.1);
                padding: 2px 8px;
                border-radius: 4px;
            }
        }
    }

    .card-footer {
        margin-top: 24px;
        text-align: center;

        .el-button {
            width: 80%;
            border-radius: 24px;
            padding: 12px 32px;
            font-size: 16px;
            font-weight: 500;
            background: linear-gradient(135deg, #409eff, #36cfc9);
            border: none;
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

            &:hover {
                transform: scale(1.05);
                transition: transform 0.3s ease;
                box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
            }
        }
    }
}

.assessment-card {
    height: 100%;
    overflow-y: auto; // 为这个容器单独添加滚动

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

// 移动端适配
@media (max-width: 768px) {
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
        gap: 20px;
        padding: 8px;
    }

    .exam-card {
        min-height: 250px;
    }

    .exam-card {
        :deep(.el-card__header) {
            padding: 20px 20px 12px;

            h3 {
                font-size: 18px;
            }
        }

        :deep(.el-card__body) {
            padding: 0 20px 20px;
        }

        .card-body {
            padding: 12px;

            p {
                font-size: 14px;
                margin: 8px 0;
            }
        }

        .card-footer {
            margin-top: 20px;

            .el-button {
                width: 90%;
                padding: 10px 24px;
                font-size: 15px;
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
}

@media (max-width: 480px) {
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

    .assessment-card {
        .chart-container {
            height: 250px;
        }
    }
}
</style>
