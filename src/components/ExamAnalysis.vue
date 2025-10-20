<template>
    <div class="analysis-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
                <Loading />
            </el-icon>
            <p>正在加载考试分析数据...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!hasData" class="empty-state">
            <div class="empty-icon">
                <el-icon>
                    <Document />
                </el-icon>
            </div>
            <h3>暂无考试分析数据</h3>
            <p>您还没有任何考试记录或数据加载失败</p>
            <el-button type="primary" @click="fetchAnalysisData">刷新数据</el-button>
        </div>

        <!-- 有数据时显示内容 -->
        <template v-else>
            <!-- 页面标题 -->
            <div class="page-header">
                <div></div>
                <div class="date-range">
                    <el-radio-group v-model="examRange" size="small" @change="handleRangeChange">
                        <el-radio-button label="10">近10场</el-radio-button>
                        <el-radio-button label="20">近20场</el-radio-button>
                    </el-radio-group>
                </div>
            </div>
            <!-- 主要指标区域 -->
            <div class="metrics-grid">
                <el-card class="metric-card gradient-card" shadow="never" :body-style="{ padding: '0' }">
                    <div class="card-content">
                        <div class="stat-icon">
                            <el-icon size="24"><Check /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-number">{{ alycard?.overallAccuracy?.num || 0 }}%</div>
                                <div class="metric-trend" v-if="alycard?.overallAccuracy?.trend !== undefined">
                                    <span v-if="alycard.overallAccuracy.trend > 0" class="trend-up">
                                        +{{ alycard.overallAccuracy.trend }}%
                                    </span>
                                    <span v-else-if="alycard.overallAccuracy.trend < 0" class="trend-down">
                                        {{ alycard.overallAccuracy.trend }}%
                                    </span>
                                </div>
                            </div>
                            <div class="stat-label">正确率</div>
                        </div>
                    </div>
                </el-card>

                <el-card class="metric-card gradient-card-2" shadow="hover" :body-style="{ padding: '0' }">
                    <div class="card-content">
                        <div class="stat-icon">
                            <el-icon size="24"><Medal /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-number">{{ alycard?.averageScore?.num || 0 }}</div>
                                <div class="metric-trend" v-if="alycard?.averageScore?.trend !== undefined">
                                    <span v-if="alycard.averageScore.trend > 0" class="trend-up">
                                        +{{ alycard.averageScore.trend }}
                                    </span>
                                    <span v-else-if="alycard.averageScore.trend < 0" class="trend-down">
                                        {{ alycard.averageScore.trend }}
                                    </span>
                                </div>
                            </div>
                            <div class="stat-label">平均得分</div>
                        </div>
                    </div>
                </el-card>

                <el-card class="metric-card gradient-card-3" shadow="hover" :body-style="{ padding: '0' }">
                    <div class="card-content">
                        <div class="stat-icon">
                            <el-icon size="24"><Warning /></el-icon>
                        </div>
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-number">{{ alycard?.totalErrors?.num || 0 }}</div>
                                <div class="metric-trend" v-if="alycard?.totalErrors?.trend !== undefined">
                                    <span v-if="alycard.totalErrors.trend < 0" class="trend-down">
                                        {{ alycard.totalErrors.trend }}%
                                    </span>
                                    <span v-else-if="alycard.totalErrors.trend > 0" class="trend-up">
                                        +{{ alycard.totalErrors.trend }}%
                                    </span>
                                </div>
                            </div>
                            <div class="stat-label">客观题错题数</div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 考试趋势分析 -->
            <el-card class="chart-card" shadow="never">
                <div class="chart-wrapper-full">
                    <v-chart v-if="chartLoaded" class="line-chart" :option="trendChartOption" :autoresize="true" />
                </div>
            </el-card>

            <!-- 高频错误分类TOP5（横向布局） -->
            <el-card class="chart-card error-ranking-card" shadow="never">
                <div><h3>高频错误分类TOP5</h3></div>
                <div v-if="errorTagsData.length > 0" class="error-ranking-container-horizontal">
                    <div
                        v-for="(tag, index) in errorTagsData"
                        :key="tag.name"
                        class="error-rank-item-horizontal"
                        :style="{ '--rank-index': index, '--tag-color': getTagColor(index) }">
                        <!-- 排名和标签名一行 -->
                        <div class="rank-item-header">
                            <div class="rank-number-horizontal">{{ index + 1 }}</div>
                            <div class="tag-name-horizontal">{{ tag.name }}</div>
                        </div>
                        <!-- 进度条和数值一行 -->
                        <div class="tag-stats-horizontal">
                            <div class="tag-bar-container-horizontal">
                                <div
                                    class="tag-bar-horizontal"
                                    :style="{
                                        width: `${(tag.value / maxTagValue) * 100}%`,
                                        backgroundColor: getTagColor(index),
                                    }"></div>
                            </div>
                            <span class="tag-percentage-horizontal">{{ tag.value }}次</span>
                            <span class="tag-rate-horizontal">({{ tag.rate || 0 }}%)</span>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <el-empty description="暂无错误标签数据" />
                </div>
            </el-card>

            <!-- 学习建议 -->
            <el-card class="insights-card" shadow="never">
                <template #header>
                    <h3>学习洞察与建议</h3>
                </template>
                <div class="insights-content">
                    <div class="insight-item" v-for="(insight, index) in insights" :key="index">
                        <div class="insight-icon">
                            <el-icon><Check /></el-icon>
                        </div>
                        <div class="insight-text">{{ insight }}</div>
                    </div>
                </div>
            </el-card>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import VChart from "vue-echarts";
import { useAuthStore } from "@/stores/auth";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Medal, Warning, Loading, Document } from "@element-plus/icons-vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, RadarChart } from "echarts/charts";
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DataZoomComponent,
    PolarComponent,
    ToolboxComponent,
} from "echarts/components";

// 注册 ECharts 组件
use([
    CanvasRenderer,
    LineChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DataZoomComponent,
    PolarComponent,
    ToolboxComponent,
]);

// 定义数据类型
interface CardMetric {
    num: number;
    trend: number;
}

interface AnalysisCard {
    overallAccuracy: CardMetric;
    averageScore: CardMetric;
    totalErrors: CardMetric;
}

interface TrendData {
    score: number[];
    accuracy: number[];
    labels: string[];
}

interface ErrorTag {
    name: string;
    value: number;
    rate?: number;
}

const authStore = useAuthStore();
const examRange = ref<string>("10"); // 默认显示近10场
const chartLoaded = ref(true);
const loading = ref(false); // 加载状态

// 计算是否有数据
const hasData = computed(() => {
    return Boolean(alycard.value || alytrendChat.value || errorTagsData.value.length > 0);
});

// 数据状态
const alycard = ref<AnalysisCard | null>(null);
const alytrendChat = ref<TrendData | null>(null);
const errorTagsData = ref<ErrorTag[]>([]);
const errorDetails = ref<any[]>([]);
const insights = ref<string[]>([]);

// 计算最大错误标签值
const maxTagValue = computed(() => {
    if (errorTagsData.value.length === 0) return 1;
    return Math.max(...errorTagsData.value.map(tag => tag.value));
});

// 图表配置
const trendChartOption = computed(() => {
    if (!alytrendChat.value) return {};

    return {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                crossStyle: {
                    color: "#999",
                },
            },
        },
        title: {
            text: "考试趋势分析",
            textStyle: {
                color: "#303133",
            },
        },
        legend: {
            data: ["得分", "正确率"],
            right: 20,
            textStyle: {
                color: "#606266",
            },
        },
        xAxis: [
            {
                type: "category",
                data: alytrendChat.value.labels,
                axisPointer: {
                    type: "shadow",
                },
                axisLabel: {
                    rotate: 45,
                    color: "#606266",
                    // 处理长标签，超过12个汉字截断显示
                    formatter: function (value: string) {
                        if (value.length > 12) {
                            return value.substring(0, 12) + "...";
                        }
                        return value;
                    },
                    // 调整标签高度和间距
                    height: 40,
                    interval: 0,
                },
                axisLine: {
                    lineStyle: {
                        color: "#e4e7ed",
                    },
                },
            },
        ],
        yAxis: [
            {
                type: "value",
                name: "得分",
                min: 0,
                max: 100,
                interval: 20,
                axisLabel: {
                    formatter: "{value}",
                    color: "#606266",
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#e4e7ed",
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: "#f0f0f0",
                        type: "dashed",
                    },
                },
            },
            {
                type: "value",
                name: "正确率",
                min: 0,
                max: 100,
                interval: 20,
                axisLabel: {
                    formatter: "{value}%",
                    color: "#606266",
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#e4e7ed",
                    },
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: "得分",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                yAxisIndex: 0,
                data: alytrendChat.value.score,
                lineStyle: {
                    color: "#409eff",
                    width: 3,
                },
                itemStyle: {
                    color: "#409eff",
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: "rgba(64, 158, 255, 0.3)",
                            },
                            {
                                offset: 1,
                                color: "rgba(64, 158, 255, 0.05)",
                            },
                        ],
                    },
                },
            },
            {
                name: "正确率",
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: 8,
                yAxisIndex: 1,
                data: alytrendChat.value.accuracy,
                lineStyle: {
                    color: "#67c23a",
                    width: 3,
                },
                itemStyle: {
                    color: "#67c23a",
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: "rgba(103, 194, 58, 0.3)",
                            },
                            {
                                offset: 1,
                                color: "rgba(103, 194, 58, 0.05)",
                            },
                        ],
                    },
                },
            },
        ],
    };
});

// 辅助函数
const getTagColor = (index: number) => {
    const colors = ["#f56c6c", "#e6a23c", "#67c23a", "#409eff", "#909399"];
    return colors[index % colors.length];
};

// 生成学习建议
const generateInsights = () => {
    if (!alycard.value || !errorTagsData.value.length) {
        insights.value = [
            "继续保持良好的学习态度，定期复习巩固所学知识",
            "建议针对错题进行专项练习，提高薄弱环节",
            "保持规律作息，确保充足睡眠，提高学习效率",
        ];
        return;
    }

    const accuracy = alycard.value.overallAccuracy.num;
    const score = alycard.value.averageScore.num;
    const topError = errorTagsData.value[0]?.name;

    const newInsights = [];

    if (accuracy < 70) {
        newInsights.push("正确率偏低，建议重点复习基础知识，加强理解和记忆");
    } else if (accuracy >= 90) {
        newInsights.push("正确率表现优秀，继续保持，可以尝试挑战更高难度的题目");
    } else {
        newInsights.push("正确率表现良好，仍有提升空间，建议针对性地加强中等难度题目的训练");
    }

    if (score < 60) {
        newInsights.push("得分较低，需要系统性地回顾知识点，建立完整的知识体系");
    } else if (score >= 85) {
        newInsights.push("得分优异，建议关注细节，减少不必要的失分");
    } else {
        newInsights.push("得分中等，建议提高解题速度和准确度，争取更好成绩");
    }

    if (topError) {
        newInsights.push(`针对"${topError}"类型的错误，建议进行专项训练，提高这方面的能力`);
    }

    newInsights.push("定期回顾错题，整理错题本，避免重复犯错");
    insights.value = newInsights;
};

// 获取数据的函数
const fetchAnalysisData = async () => {
    loading.value = true;
    // 重置数据状态
    alycard.value = null;
    alytrendChat.value = null;
    errorTagsData.value = [];
    errorDetails.value = [];

    try {
        // 实际从API获取数据
        const result = await authStore.fetchAuthReq(`/mapi/napi/exam_alydata?range=${examRange.value}`, "GET");

        if (result && result.status === 0 && result.data) {
            // 更新卡片数据ca
            if (result.data.alycard) {
                alycard.value = result.data.alycard;
            }

            // 更新趋势图表数据
            if (result.data.alytrendChat) {
                alytrendChat.value = result.data.alytrendChat;
            }

            // 更新错误标签数据
            if (result.data.alyerrtags) {
                // 转换数据格式，获取top5
                errorTagsData.value = Object.entries(result.data.alyerrtags)
                    .slice(0, 5)
                    .map(([key, value]: [string, any]) => ({
                        name: value.name,
                        value: value.value,
                        rate: value.rate == null || value.rate == 0 ? 1 : value.rate,
                    }));
            }

            // 更新错题详情（这里使用模拟数据，实际应该从API获取）
            if (result.data.errorDetails) {
                errorDetails.value = result.data.errorDetails.slice(0, 10); // 只显示最新的10条
            } else {
                errorDetails.value = [];
            }

            // 生成学习建议
            generateInsights();

            // 保存到本地缓存，添加时间戳
            localStorage.setItem(
                "examAnalysisData",
                JSON.stringify({
                    alycard: alycard.value,
                    alytrendChat: alytrendChat.value,
                    errorTagsData: errorTagsData.value,
                    errorDetails: errorDetails.value,
                    range: examRange.value,
                    timestamp: Date.now(), // 添加时间戳
                })
            );
        } else {
            // 尝试使用缓存数据
            loadMockOrCachedData();
        }
    } catch (error) {
        console.error("获取考试分析数据失败:", error);
        // 尝试使用缓存数据
        loadMockOrCachedData();
    } finally {
        loading.value = false;
    }
};

// 加载模拟或缓存数据
const loadMockOrCachedData = () => {
    // 尝试从缓存获取
    const cachedData = localStorage.getItem("examAnalysisData");
    if (!cachedData) {
        return;
    }
    try {
        const parsedData = JSON.parse(cachedData);

        // 检查数据是否过期（30分钟 = 30 * 60 * 1000毫秒）
        const isExpired = parsedData.timestamp && Date.now() - parsedData.timestamp > 30 * 60 * 1000;
        if (isExpired) {
            console.log("缓存数据已过期，清除缓存");
            localStorage.removeItem("examAnalysisData");
            return;
        }

        if (parsedData.alycard) alycard.value = parsedData.alycard;
        if (parsedData.alytrendChat) alytrendChat.value = parsedData.alytrendChat;
        if (parsedData.errorTagsData) errorTagsData.value = parsedData.errorTagsData;
        if (parsedData.errorDetails) errorDetails.value = parsedData.errorDetails;
        generateInsights();
    } catch (parseError) {
        console.error("解析缓存数据失败:", parseError);
    }
};

// 切换考试范围
const handleRangeChange = () => {
    fetchAnalysisData();
};

// 组件挂载时获取数据
onMounted(() => {
    fetchAnalysisData();
});
</script>

<style scoped lang="scss">
.analysis-container {
    min-height: 100vh;
    background-color: #f5f7fa;
}

// 页面标题和选择器
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
}

.metric-card {
    border: none;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: visible;

    :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
    }

    .card-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        gap: 16px;
        flex: 1;
    }

    .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 8px;
    }

    .stat-icon {
        flex-shrink: 0;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
        flex: 1;
        min-width: 0;

        .stat-number {
            font-weight: bold;
            font-size: 32px;
            margin-bottom: 4px;
            color: inherit;
        }

        .stat-label {
            opacity: 0.9;
            font-size: 14px;
            color: inherit;
        }
    }

    .metric-trend {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .trend-up {
        color: #67c23a;
    }

    .trend-down {
        color: #f56c6c;
    }
}

// 渐变卡片样式
.gradient-card {
    background-image: url("/img/exam-bg2.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 16px;
    color: #667eea;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 5px 10px rgba(102, 126, 234, 0.4);

    &:hover {
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
        transform: translateY(-4px) scale(1.02);
    }

    .stat-icon {
        background: rgba(118, 156, 244, 0.2);
    }
}

.gradient-card-2 {
    background-image: url("/img/exam-bg3.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 16px;
    color: #667eea;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(45, 136, 200, 0.4);

    &:hover {
        box-shadow: 0 10px 30px rgba(45, 136, 200, 0.5);
        transform: translateY(-4px) scale(1.02);
    }

    .stat-icon {
        background: rgba(102, 126, 234, 0.2);
    }
}

.gradient-card-3 {
    background-image: url("/img/exam-bg1.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 16px;
    color: #b44708;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(255, 107, 107, 0.4);

    &:hover {
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.5);
        transform: translateY(-4px) scale(1.02);
    }

    .stat-icon {
        background: rgba(255, 107, 107, 0.2);
    }
}

.chart-card {
    margin-bottom: 24px;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__header) {
        padding: 18px 20px;
        background-color: #fff;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #303133;
        }
    }

    :deep(.el-card__body) {
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
}

// 图表容器
.chart-wrapper-full {
    width: 100%;
    height: 400px;
    position: relative;
    min-height: 400px; /* 确保最小高度 */
}

.line-chart {
    width: 100% !important;
    height: 100% !important;
    min-height: 400px;
}

// 错误标签榜单样式（横向布局）
.error-ranking-card {
    margin-bottom: 24px;
    background: linear-gradient(180deg, rgba(255, 248, 235, 0.8), rgba(255, 252, 240, 0.2));
}

.error-ranking-container-horizontal {
    display: flex;
    flex-direction: row;
    gap: 20px;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
}

.error-rank-item-horizontal {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    padding: 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.95);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: var(--tag-color);
    }

    &:hover {
        transform: translateY(-6px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
}

.rank-item-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    width: 100%;
}

.rank-number-horizontal {
    width: 32px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
    margin-right: 12px;
    background: var(--tag-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.tag-name-horizontal {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

.tag-stats-horizontal {
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 12px;
    gap: 8px;
}

.tag-bar-container-horizontal {
    flex: 1;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tag-bar-horizontal {
    height: 100%;
    transition: width 0.8s ease;
    border-radius: 4px;
}

.tag-percentage-horizontal {
    color: #f56c6c;
    font-weight: 600;
    min-width: 40px;
    text-align: right;
}

.tag-rate-horizontal {
    color: #909399;
    font-size: 11px;
}

// 学习建议卡片
.insights-card {
    margin-bottom: 24px;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__header) {
        padding: 18px 20px;
        background-color: #e6f7ff;
        border-bottom: 1px solid #bae7ff;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1890ff;
        }
    }

    :deep(.el-card__body) {
        padding: 20px;
    }
}

.insights-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.insight-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background-color: #f0f9ff;
    border-radius: 8px;
    border-left: 4px solid #409eff;
    transition: all 0.3s ease;

    &:hover {
        background-color: #e6f7ff;
        transform: translateX(4px);
    }
}

.insight-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #409eff;
    color: white;
    border-radius: 50%;
    margin-top: 2px;
}

.insight-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
}

// 加载状态样式
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    padding: 40px;
    margin-bottom: 24px;

    .loading-icon {
        font-size: 48px;
        color: #409eff;
        margin-bottom: 16px;
        animation: rotate 1s linear infinite;
    }

    p {
        color: #606266;
        font-size: 16px;
        margin: 0;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
}

// 空状态样式
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    margin-top: 40px;

    .empty-icon {
        font-size: 64px;
        color: #c0c4cc;
        margin-bottom: 16px;
    }

    h3 {
        color: #606266;
        font-size: 18px;
        margin: 0 0 8px 0;
        font-weight: 500;
    }

    p {
        color: #909399;
        font-size: 14px;
        margin: 0 0 24px 0;
    }
}

// 移动端适配
@media (max-width: 768px) {
    .analysis-container {
        padding: 12px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .column-layout {
        flex-direction: column;
    }

    .chart-wrapper-full {
        min-height: 300px;
    }

    .error-rank-item {
        flex-wrap: wrap;

        .rank-number {
            margin-bottom: 8px;
        }

        .rank-content {
            width: calc(100% - 48px);
        }
    }
}

// 超小屏幕适配
@media (max-width: 480px) {
    .chart-wrapper-full {
        min-height: 250px;
    }

    .card-content {
        padding: 16px;
    }

    .stat-number {
        font-size: 24px !important;
    }
}
</style>
