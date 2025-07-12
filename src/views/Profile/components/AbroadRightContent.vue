<template>
    <div class="schedule-stats">
        <el-card class="stat-card gradient-card-schedule" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.totalClasses }}</div>
                <div class="stat-label">总课程数</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-schedule-2" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><Check /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.completedClasses }}</div>
                <div class="stat-label">已完成</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-schedule-3" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><Clock /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ scheduleStats.weeklyHours }}h</div>
                <div class="stat-label">本周课时</div>
            </div>
        </el-card>

        <!-- 近期课程 -->
        <el-card class="upcoming-card" shadow="hover">
            <template #header>
                <h4>课程提醒</h4>
            </template>
            <div class="upcoming-list">
                <div 
                    v-for="course in upcomingCourses"
                    :key="course.id"
                    class="upcoming-item"
                    :class="{ 'soon': course.isSoon }">
                    <div class="course-time">
                        <div class="time-label">{{ course.time }}</div>
                        <div class="date-label">{{ course.date }}</div>
                    </div>
                    <div class="course-info">
                        <h5>{{ course.title }}</h5>
                        <p class="teacher">{{ course.teacher }}</p>
                    </div>
                    <div class="course-status">
                        <el-tag 
                            :type="course.isSoon ? 'warning' : 'info'"
                            size="small">
                            {{ course.isSoon ? '即将开始' : '待开始' }}
                        </el-tag>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 排课统计数据
const scheduleStats = ref({
    totalClasses: 45,
    completedClasses: 28,
    weeklyHours: 12,
});

// 近期课程数据
const upcomingCourses = ref([
    {
        id: 1,
        title: "雅思口语一对一",
        teacher: "张老师",
        time: "19:00",
        date: "今天",
        isSoon: true
    },
    {
        id: 2,
        title: "雅思写作强化班",
        teacher: "李老师",
        time: "20:00",
        date: "明天",
        isSoon: false
    },
    {
        id: 3,
        title: "雅思听力技巧",
        teacher: "王老师",
        time: "19:00",
        date: "后天",
        isSoon: false
    }
]);

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