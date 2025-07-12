<template>
    <div class="schedule-stats">
        <el-card class="stat-card gradient-card-schedule" shadow="hover" v-loading="loadingScheduleStats">
            <div class="stat-icon">
                <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.lastMonthTotal }}</div>
                <div class="stat-label">上月总课时</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-schedule-2" shadow="hover" v-loading="loadingScheduleStats">
            <div class="stat-icon">
                <el-icon size="24"><Check /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.currentMonthTotal }}</div>
                <div class="stat-label">本月总课时</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-schedule-3" shadow="hover" v-loading="loadingScheduleStats">
            <div class="stat-icon">
                <el-icon size="24"><Clock /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.nextMonthTotal }}</div>
                <div class="stat-label">下月总课时</div>
            </div>
        </el-card>

        <!-- 近期课程 -->
        <el-card class="upcoming-card" shadow="hover" v-loading="loadingScheduleStats">
            <template #header>
                <h4>当周临近课程提醒</h4>
            </template>
            <div class="upcoming-list" v-if="scheduleStats.weekScheduleList.length > 0">
                <div
                    v-for="course in scheduleStats.weekScheduleList"
                    class="upcoming-item"
                    :class="{ soon: course.isSoon == 1 }">
                    <div class="course-time">
                        <div class="time-label">{{ course.time }}</div>
                        <div class="date-label">{{ course.date }}</div>
                    </div>
                    <div class="course-info">
                        <h5>{{ course.title }}</h5>
                        <p class="teacher">{{ course.name }}</p>
                    </div>
                    <div class="course-status">
                        <el-tag :type="course.isSoon == 1 ? 'warning' : 'info'" size="small">
                            {{ course.isSoon == 1 ? "即将开始" : "待开始" }}
                        </el-tag>
                    </div>
                </div>
            </div>
            <!-- 空状态 -->
            <div v-else class="empty-courses">
                <div class="empty-icon">
                    <el-icon size="48"><Calendar /></el-icon>
                </div>
                <div class="empty-text">暂无课程安排</div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

// 类型定义
interface Course {
    title: string;
    name: string;
    teacher: string;
    time: string;
    date: string;
    isSoon: number;
}

interface ScheduleStats {
    lastMonthTotal: string;
    currentMonthTotal: string;
    nextMonthTotal: string;
    weekScheduleList: Course[];
}

interface ApiResponse {
    status: number;
    data: {
        last_month_total?: string;
        current_month_total?: string;
        next_month_total?: string;
        week_schedule_list?: Array<{
            title: string;
            teacher: string;
            time: string;
            date: string;
            is_soon: number;
        }>;
    };
    msg?: string;
}

// 常量定义
const COURSE_STATUS = {
    SOON: 1,
    PENDING: 0,
} as const;

const DEFAULT_STATS: ScheduleStats = {
    lastMonthTotal: "-",
    currentMonthTotal: "-",
    nextMonthTotal: "-",
    weekScheduleList: [],
};

// 组合式函数
const useScheduleRightContent = () => {
    const authStore = useAuthStore();

    // 响应式数据
    const loadingScheduleStats = ref(false);
    const scheduleStats = ref<ScheduleStats>({ ...DEFAULT_STATS });

    // 工具函数
    const transformCourseData = (course: any): Course => ({
        title: course.title,
        name: course.teacher, // 使用 teacher 作为 name
        teacher: course.teacher,
        time: course.time,
        date: course.date,
        isSoon: course.is_soon,
    });

    const handleApiResponse = (result: ApiResponse) => {
        if (result.status === 0) {
            scheduleStats.value = {
                lastMonthTotal: result.data.last_month_total || DEFAULT_STATS.lastMonthTotal,
                currentMonthTotal: result.data.current_month_total || DEFAULT_STATS.currentMonthTotal,
                nextMonthTotal: result.data.next_month_total || DEFAULT_STATS.nextMonthTotal,
                weekScheduleList:
                    result.data.week_schedule_list?.map(transformCourseData) || DEFAULT_STATS.weekScheduleList,
            };
        } else {
            throw new Error(result.msg || "获取排课统计失败");
        }
    };

    // 主要方法
    const fetchScheduleStats = async () => {
        loadingScheduleStats.value = true;
        try {
            const result = (await authStore.fetchAuthReq("/napi/schedule/tsummary", "GET")) as ApiResponse;
            handleApiResponse(result);
        } catch (error) {
            console.error("获取排课统计失败:", error);
            ElMessage.error("获取排课统计失败");
        } finally {
            loadingScheduleStats.value = false;
        }
    };

    // 暴露刷新方法供父组件调用
    const refreshSummary = async () => {
        await fetchScheduleStats();
    };

    return {
        loadingScheduleStats,
        scheduleStats,
        fetchScheduleStats,
        refreshSummary,
    };
};

// 使用组合式函数
const { loadingScheduleStats, scheduleStats, fetchScheduleStats, refreshSummary } = useScheduleRightContent();

// 组件挂载时获取数据
onMounted(() => {
    fetchScheduleStats();
});

// 暴露方法给父组件
defineExpose({
    refreshSummary,
});
</script>

<style scoped lang="scss">
.schedule-stats {
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

.gradient-card-schedule {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
}

.gradient-card-schedule-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(245, 87, 108, 0.3);
    }
}

.gradient-card-schedule-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
    }
}

.upcoming-card {
    :deep(.el-card__header) {
        h4 {
            margin: 0;
            color: #303133;
        }
    }

    .upcoming-list {
        .upcoming-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f2f5;
            transition: all 0.3s ease;

            &:last-child {
                border-bottom: none;
            }

            &.soon {
                background: #fff7e6;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
            }

            .course-time {
                width: 60px;
                text-align: center;
                margin-right: 12px;

                .time-label {
                    font-weight: 500;
                    color: #303133;
                    font-size: 14px;
                }

                .date-label {
                    color: #909399;
                    font-size: 12px;
                }
            }

            .course-info {
                flex: 1;

                h5 {
                    margin: 0 0 4px 0;
                    color: #303133;
                    font-size: 14px;
                }

                .teacher {
                    margin: 0;
                    color: #606266;
                    font-size: 13px;
                }
            }

            .course-status {
                margin-left: 12px;
            }
        }
    }

    .empty-courses {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 0;
        color: #909399;
        font-size: 16px;

        .empty-icon {
            margin-bottom: 15px;
        }

        .empty-text {
            font-weight: bold;
            margin-bottom: 8px;
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .schedule-stats {
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

    .upcoming-card {
        grid-column: 1 / -1;

        .upcoming-list {
            .upcoming-item {
                .course-time {
                    width: 50px;
                    margin-right: 8px;

                    .time-label {
                        font-size: 13px;
                    }

                    .date-label {
                        font-size: 11px;
                    }
                }

                .course-info {
                    h5 {
                        font-size: 13px;
                    }

                    .teacher {
                        font-size: 12px;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .schedule-stats {
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

    .upcoming-card {
        .upcoming-list {
            .upcoming-item {
                flex-direction: column;
                align-items: flex-start;

                .course-time {
                    width: 100%;
                    text-align: left;
                    margin-right: 0;
                    margin-bottom: 8px;
                }

                .course-status {
                    margin-left: 0;
                    margin-top: 8px;
                }
            }
        }
    }
}
</style>
