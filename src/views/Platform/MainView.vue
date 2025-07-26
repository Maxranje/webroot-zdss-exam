<template>
    <div class="profile-page">
        <el-container>
            <el-header class="top-nav">
                <div class="nav-left">
                    <img src="/img/logo.png" alt="Logo" class="logo" />
                </div>
                <div class="nav-right"></div>
            </el-header>
            <el-main class="main-content">
                <el-row>
                    <el-col>
                        <el-card class="platform-form-card" shadow="hover">
                            <el-form
                                :model="platformForm"
                                :rules="formRules"
                                ref="platformFormRef"
                                label-width="80px"
                                :inline="true">
                                <el-form-item prop="type">
                                    <el-select
                                        v-model="platformForm.type"
                                        placeholder="请选择类型"
                                        size="large"
                                        @change="handleTypeChange"
                                        class="form-select">
                                        <el-option label="班级" value="group" />
                                        <el-option label="学生" value="student" />
                                        <el-option label="教师" value="teacher" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item prop="selectedId">
                                    <el-select
                                        v-model="platformForm.selectedId"
                                        placeholder="请先选择类型"
                                        :disabled="!platformForm.type"
                                        size="large"
                                        class="form-select"
                                        filterable>
                                        <el-option
                                            v-for="item in optionList"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item>
                                    <el-button
                                        type="primary"
                                        @click="handleSubmit"
                                        :loading="submitLoading"
                                        size="large">
                                        提交
                                    </el-button>
                                    <el-dropdown
                                        @command="handleExportCommand"
                                        :disabled="!platformForm.type || !platformForm.selectedId">
                                        <el-button type="warning" :loading="exportLoading" size="large">
                                            导出数据
                                            <el-icon class="el-icon--right"><arrow-down /></el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
                                                <el-dropdown-item command="csv">导出为 CSV</el-dropdown-item>
                                                <el-dropdown-item command="json">导出为 JSON</el-dropdown-item>
                                                <el-dropdown-item command="html">导出为 HTML</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <component
                            :is="baseCalendar"
                            ref="baseCalendarView"
                            :type="platformForm.type"
                            :selected-id="platformForm.selectedId" />
                    </el-col>
                </el-row>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import baseCalendar from "@/views/Platform/components/CalendarView.vue";
import { exportCalendarData } from "@/utils/export";

interface PlatformOption {
    id: string;
    name: string;
}

interface PlatformForm {
    type: string;
    selectedId: string;
}

const authStore = useAuthStore();

// 响应式数据
const baseCalendarView = ref<InstanceType<typeof baseCalendar> | null>(null);
const platformFormRef = ref();
const submitLoading = ref(false);
const exportLoading = ref(false);

// 表单数据
const platformForm = ref<PlatformForm>({
    type: "",
    selectedId: "",
});

// 选项列表
const optionList = ref<PlatformOption[]>([]);

// 表单验证规则
const formRules = {
    type: [{ message: "请选择分类", trigger: "change" }],
    selectedId: [{ message: "请选择", trigger: "change" }],
};

// 处理类型变化
const handleTypeChange = async (value: string) => {
    platformForm.value.selectedId = "";
    optionList.value = [];
    await fetchOptions(value);
};

// 统一的选项获取方法
const fetchOptions = async (type: string) => {
    if (!type) return;

    try {
        const result = await authStore.fetchAuthReq("/mapi/napi/calendar_typelists", "POST", {
            type: type,
        });

        if (result.status === 0 && result.data.list) {
            optionList.value = result.data.list;
        } else {
            ElMessage.error(result.msg || "获取选项列表失败");
        }
    } catch (error) {
        console.error("获取选项列表失败:", error);
        ElMessage.error("获取选项列表失败");
    }
};

// 处理表单提交
const handleSubmit = async () => {
    try {
        await platformFormRef.value.validate();
        submitLoading.value = true;

        if (baseCalendarView.value) {
            // 传递当前表单的类型和选中ID
            await baseCalendarView.value.fetchCalendarData(platformForm.value.type, platformForm.value.selectedId);
        }
    } catch (error) {
        console.error("提交失败:", error);
        ElMessage.error("提交失败");
    } finally {
        submitLoading.value = false;
    }
};

// 处理导出命令
const handleExportCommand = async (command: string) => {
    if (!platformForm.value.type || !platformForm.value.selectedId) {
        ElMessage.warning("请先选择类型和具体项目");
        return;
    }

    try {
        exportLoading.value = true;

        // 获取当前日历的可视范围
        const { startDate, endDate } = baseCalendarView.value?.getCalendarDateRange() || {};

        // 获取当前显示的事件数据
        const calendarApi = baseCalendarView.value?.baseCalendar?.getApi();
        if (!calendarApi) {
            ElMessage.error("日历组件未初始化");
            return;
        }

        // 获取当前显示的所有事件
        const events = calendarApi.getEvents();

        if (events.length === 0) {
            ElMessage.warning("当前时间段内没有数据可导出");
            return;
        }

        // 生成文件名
        const fileName = `日历数据_${platformForm.value.type}_${startDate}_${endDate}`;

        // 使用统一的导出方法
        const success = exportCalendarData(events, command as any, fileName);

        if (success) {
            const formatMap: Record<string, string> = {
                excel: "Excel",
                csv: "CSV",
                json: "JSON",
                html: "HTML",
            };
            ElMessage.success(`成功导出 ${events.length} 条记录到 ${fileName}.${command}`);
        } else {
            ElMessage.error("导出失败");
        }
    } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败");
    } finally {
        exportLoading.value = false;
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

    .nav-right {
        padding-right: 24px;
    }
}

.main-content {
    display: flex;
    flex-direction: column;
    padding: 1.75rem 1rem;

    .el-row {
        width: 100%;
        margin-bottom: 24px;
    }

    .platform-form-card {
        :deep(.el-card__body) {
            padding: 20px;
        }

        :deep(.el-form) {
            .el-form-item {
                margin-right: 20px;
                margin-bottom: 16px;

                .el-form-item__label {
                    font-weight: 500;
                    color: #606266;
                }

                .form-select {
                    min-width: 300px;
                }

                .el-button {
                    margin-right: 12px;

                    &:last-child {
                        margin-right: 0;
                    }
                }
            }
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .profile-page {
        .top-nav {
            padding: 0 16px;

            .nav-right {
                padding-right: 0;
            }
        }

        .main-content {
            padding: 16px;
        }
    }
}

// 超小屏幕适配
@media (max-width: 480px) {
    .profile-page {
        .top-nav {
            padding: 0 12px;

            .logo {
                height: 32px;
            }
        }

        .main-content {
            padding: 0.75rem;

            .el-row {
                width: 100% !important;
                margin: 0 !important;

                :deep(.el-col) {
                    margin: 0;
                    padding: 0;
                }
            }
        }
    }

    .platform-form-card {
        :deep(.el-card__body) {
            padding: 12px;
        }

        :deep(.el-form) {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;

            .el-form-item {
                margin-right: 0 !important;
                margin-bottom: 16px !important;
                width: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;

                .el-form-item__label {
                    margin-bottom: 8px !important;
                    text-align: left !important;
                }

                .form-select {
                    width: 100% !important;
                    max-width: 280px !important;
                }

                .el-button {
                    margin-right: 8px !important;
                    margin-bottom: 8px !important;

                    &:last-child {
                        margin-right: 0 !important;
                    }
                }
            }
        }
    }
}
</style>
