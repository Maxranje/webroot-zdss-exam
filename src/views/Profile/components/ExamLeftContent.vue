<template>
    <el-tabs v-model="activeTab" class="custom-tabs">
        <!-- 历史考试记录 -->
        <el-tab-pane label="历史考试记录" name="history">
            <el-table :data="examHistory" style="width: 100%">
                <el-table-column prop="examId" label="考试ID" width="120" />
                <el-table-column prop="paperName" label="试卷名称" />
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="duration" label="时长" width="80" />
                <el-table-column prop="score" label="分数" width="100">
                    <template #default="scope">
                        <el-tag :type="getScoreType(scope.row.score)">
                            {{ scope.row.score }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button size="small" @click="viewReport(scope.row)">
                            查看报告
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>

        <!-- 待考试记录 -->
        <el-tab-pane label="待考试记录" name="pending">
            <div class="exam-cards">
                <el-card
                    v-for="exam in pendingExams"
                    :key="exam.id"
                    class="exam-card"
                    shadow="hover">
                    <template #header>
                        <h3>{{ exam.name }}</h3>
                    </template>
                    <div class="card-body">
                        <p>
                            <el-icon><Calendar /></el-icon>
                            {{ exam.date }}
                        </p>
                        <p>
                            <el-icon><Clock /></el-icon>
                            预计时长：{{ exam.duration }}
                        </p>
                    </div>
                    <div class="card-footer">
                        <el-button type="primary" @click="startExam(exam)">开始考试</el-button>
                    </div>
                </el-card>
            </div>
        </el-tab-pane>

        <!-- 能力评估 -->
        <el-tab-pane label="能力评估" name="assessment">
            <el-card class="assessment-card" shadow="never">
                <template #header>
                    <h3>能力评估雷达图</h3>
                </template>
                <div class="chart-container">
                    <v-chart class="chart" :option="radarOption" />
                </div>
            </el-card>
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { RadarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

// 注册 ECharts 组件
use([CanvasRenderer, RadarChart, GridComponent, TooltipComponent, LegendComponent]);

const router = useRouter();

// 响应式数据
const activeTab = ref("history");

// 历史考试记录
const examHistory = ref([
    {
        examId: "EX001",
        paperName: "雅思模拟考试 A卷",
        date: "2024-01-15",
        duration: "120分",
        score: 7.5,
    },
    {
        examId: "EX002",
        paperName: "托福听力专项训练",
        date: "2024-01-10",
        duration: "60分",
        score: 6.5,
    },
    {
        examId: "EX003",
        paperName: "雅思写作专项",
        date: "2024-01-05",
        duration: "90分",
        score: 8.0,
    },
]);

// 待考试记录
const pendingExams = ref([
    {
        id: 1,
        name: "雅思模拟考试 B卷",
        date: "2024-01-20",
        duration: "2小时30分钟",
    },
    {
        id: 2,
        name: "托福口语专项",
        date: "2024-01-22",
        duration: "1小时",
    },
]);

// 雷达图配置
const radarOption = ref({
    tooltip: {},
    legend: {
        data: ["当前能力", "平均线"],
    },
    radar: {
        indicator: [
            { name: "听力", max: 10 },
            { name: "阅读", max: 10 },
            { name: "写作", max: 10 },
            { name: "口语", max: 10 },
            { name: "词汇", max: 10 },
        ],
    },
    series: [
        {
            name: "能力评估",
            type: "radar",
            data: [
                {
                    value: [7.5, 8.0, 6.5, 7.0, 8.5],
                    name: "当前能力",
                },
                {
                    value: [6.0, 6.5, 6.0, 6.2, 7.0],
                    name: "平均线",
                },
            ],
        },
    ],
});

// 方法
const getScoreType = (score: number) => {
    if (score >= 8) return "success";
    if (score >= 7) return "warning";
    return "info";
};

const viewReport = (exam: any) => {
    ElMessage.info(`查看 ${exam.paperName} 的详细报告`);
};

const startExam = (exam: any) => {
    ElMessage.success(`开始考试：${exam.name}`);
    router.push("/exam");
};
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
        overflow-y: auto;
        order: 1;

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