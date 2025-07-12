<template>
    <div class="abroadplan-stats">
        <el-card class="stat-card gradient-card-abroadplan" shadow="hover" v-loading="loadingStats">
            <div class="stat-icon">
                <el-icon size="24"><Calendar /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ abroadplanInfo.totalServices }}</div>
                <div class="stat-label">留学总服务数</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-abroadplan-2" shadow="hover" v-loading="loadingStats">
            <div class="stat-icon">
                <el-icon size="24"><Check /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ abroadplanInfo.completedServices }}</div>
                <div class="stat-label">已完成服务数</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-abroadplan-3" shadow="hover" v-loading="loadingStats">
            <div class="stat-icon">
                <el-icon size="24"><Clock /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ abroadplanInfo.progressServices }}</div>
                <div class="stat-label">进行中服务数</div>
            </div>
        </el-card>

        <!-- 待办事项提醒 -->
        <el-card class="todo-card" shadow="hover" v-loading="loadingStats">
            <template #header>
                <h4>待确认事项</h4>
            </template>
            <div class="todo-list" v-if="abroadplanInfo.todoItems.length > 0">
                <div v-for="(todo, index) in abroadplanInfo.todoItems" :key="index" class="todo-item">
                    <div class="todo-content">
                        <div class="todo-service">{{ todo.serviceName }}</div>
                        <div class="todo-count">
                            <span class="count-label">待学员确认：</span>
                            <span class="count-number">{{ todo.pendingCount }}</span>
                            <span class="count-unit">项</span>
                        </div>
                    </div>
                    <div class="todo-status">
                        <el-tag :type="todo.pendingCount > 50 ? 'danger' : 'warning'" size="small" round>
                            {{ todo.pendingCount > 50 ? "紧急" : "待办" }}
                        </el-tag>
                    </div>
                </div>
            </div>
            <div v-else class="empty-todos">
                <div class="empty-icon">
                    <el-icon size="48"><Check /></el-icon>
                </div>
                <div class="empty-text">暂无待确认事项</div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import { Calendar, Check, Clock } from "@element-plus/icons-vue";

// 定义接口
interface TodoItem {
    serviceName: string;
    pendingCount: number;
}

interface AbroadplanInfo {
    totalServices: string;
    completedServices: string;
    progressServices: string;
    todoItems: TodoItem[];
}

// 获取认证 store
const authStore = useAuthStore();

// 加载状态
const loadingStats = ref(false);

// 数据定义
const abroadplanInfo = ref<AbroadplanInfo>({
    totalServices: "0",
    completedServices: "0",
    progressServices: "0",
    todoItems: [],
});

// 获取统计数据
const fetchAbroadplanInfo = async () => {
    loadingStats.value = true;
    try {
        const result = await authStore.fetchAuthReq("/napi/abroadplan/summary", "GET");
        if (result.status === 0) {
            abroadplanInfo.value.totalServices = result.data.total_services || "0";
            abroadplanInfo.value.completedServices = result.data.completed_services || "0";
            abroadplanInfo.value.progressServices = result.data.progress_services || "0";
            if (result.data.todo_items) {
                abroadplanInfo.value.todoItems = result.data.todo_items.map((item: any) => ({
                    serviceName: item.service_name,
                    pendingCount: item.pending_count || 0,
                }));
            }
        } else {
            ElMessage.error(result.msg || "获取统计数据失败");
        }
    } catch (error) {
        console.error("获取统计数据失败:", error);
        ElMessage.error("获取统计数据失败");
    } finally {
        loadingStats.value = false;
    }
};

// 暴露方法给父组件调用
defineExpose({
    refreshSummary: fetchAbroadplanInfo,
});

// 组件挂载时获取数据
onMounted(() => {
    fetchAbroadplanInfo();
});
</script>

<style scoped lang="scss">
.abroadplan-stats {
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

.gradient-card-abroadplan {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
}

.gradient-card-abroadplan-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(245, 87, 108, 0.3);
    }
}

.gradient-card-abroadplan-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
    }
}

.todo-card {
    :deep(.el-card__header) {
        h4 {
            margin: 0;
            color: #303133;
        }
    }

    .empty-todos {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 0;
        color: #909399;

        .empty-icon {
            margin-bottom: 15px;
        }

        .empty-text {
            font-weight: bold;
            font-size: 16px;
        }
    }
}

.todo-list {
    .todo-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid #f0f2f5;
        transition: all 0.3s ease;

        &:last-child {
            border-bottom: none;
        }

        &:hover {
            background: #fafbfc;
            border-radius: 8px;
            padding: 16px 12px;
        }

        .todo-content {
            flex: 1;

            .todo-service {
                font-weight: 500;
                color: #303133;
                font-size: 16px;
                margin-bottom: 6px;
            }

            .todo-count {
                display: flex;
                align-items: center;
                gap: 4px;

                .count-label {
                    color: #606266;
                    font-size: 14px;
                }

                .count-number {
                    color: #409eff;
                    font-weight: bold;
                    font-size: 16px;
                }

                .count-unit {
                    color: #909399;
                    font-size: 13px;
                }
            }
        }

        .todo-status {
            margin-left: 12px;
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .abroadplan-stats {
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

    .todo-card {
        grid-column: 1 / -1;
    }

    .todo-list {
        .todo-item {
            padding: 12px 0;

            &:hover {
                padding: 12px 8px;
            }

            .todo-content {
                .todo-service {
                    font-size: 15px;
                }

                .todo-count {
                    .count-number {
                        font-size: 15px;
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .abroadplan-stats {
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

    .todo-list {
        .todo-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 12px 0;

            &:hover {
                padding: 12px 8px;
            }

            .todo-status {
                margin-left: 0;
                align-self: flex-end;
            }
        }
    }
}
</style>
