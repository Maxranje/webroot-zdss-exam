<template>
    <BaseCalendar
        ref="baseCalendar"
        :events="calendarEvents"
        :dates-set="handleDatesSet"
        :event-content="renderEventContent" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseCalendar from "@/components/BaseCalendar.vue";
import { useAuthStore } from "@/stores/auth";

// 定义props接收父组件传递的参数
interface Props {
    type?: string;
    selectedId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: "",
    selectedId: "",
});

// 定义日历事件的类型
interface CalendarEvent {
    title: string;
    start: string;
    end: string;
    extendedProps: {
        teacher: string;
        subject: string;
        location: string;
        state: number;
    };
}

// 日历事件数据
const calendarEvents = ref<CalendarEvent[]>([]);

// BaseCalendar 实例引用
const baseCalendar = ref<InstanceType<typeof BaseCalendar> | null>(null);

// 获取auth store
const authStore = useAuthStore();

// 监听props变化，当类型或选中ID变化时重新获取数据
watch(
    () => [props.type, props.selectedId],
    ([newType, newSelectedId], [oldType, oldSelectedId]) => {
        // 只有当类型和选中ID都有值时才获取数据
        if (newType && newSelectedId && (newType !== oldType || newSelectedId !== oldSelectedId)) {
            console.log("Props变化，重新获取数据:", { newType, newSelectedId });
            fetchCalendarData();
        }
    },
    { immediate: false }
);

// 获取日历数据的函数
const fetchCalendarData = async (forceType?: string, forceSelectedId?: string) => {
    // 如果没有传递强制参数，使用props中的值
    const type = forceType || props.type;
    const selectedId = forceSelectedId || props.selectedId;

    // 如果没有类型或选中ID，不执行请求
    if (!type || !selectedId) {
        console.log("缺少必要参数，跳过数据获取");
        return;
    }

    try {
        // 获取当前日历的可视范围
        const { startDate, endDate } = getCalendarDateRange();

        // 调用认证请求接口
        const result = await authStore.fetchAuthReq("/mapi/napi/calendar_platform", "POST", {
            start_date: startDate,
            end_date: endDate,
            type: type,
            selected_id: selectedId,
        });

        if (result.status === 0) {
            if (result.data.lists) {
                calendarEvents.value = result.data.lists;
                updateCalendarEvents(result.data.lists);
                console.log("日历数据更新成功", result.data.lists);
            } else {
                calendarEvents.value = [];
                updateCalendarEvents([]);
                console.log("没有日历数据");
            }
        } else {
            throw new Error(result.msg || "获取日历数据失败");
        }
    } catch (error) {
        console.error("获取日历数据失败:", error);
        // 如果接口请求失败，清空数据
        calendarEvents.value = [];
        updateCalendarEvents([]);
    }
};

// 获取日历的可视范围
const getCalendarDateRange = (): { startDate: string; endDate: string } => {
    const calendarApi = baseCalendar.value?.getApi();
    let startDate: string, endDate: string;
    if (calendarApi) {
        const view = calendarApi.view;
        // 格式化为 YYYY-MM-DD 格式
        startDate = view.activeStart.toISOString().split("T")[0];
        endDate = view.activeEnd.toISOString().split("T")[0];
    } else {
        // 如果日历还未初始化，使用当前月份
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        startDate = startOfMonth.toISOString().split("T")[0];
        endDate = endOfMonth.toISOString().split("T")[0];
    }
    return { startDate, endDate };
};

// 更新日历事件
const updateCalendarEvents = (events: CalendarEvent[]) => {
    // 直接更新响应式数据，让 BaseCalendar 组件自动更新
    calendarEvents.value = events;
};

// 处理日期变化的函数
const handleDatesSet = (dateInfo: any) => {
    // 当日期范围发生变化时，只有在有有效参数的情况下才重新获取数据
    if (props.type && props.selectedId) {
        fetchCalendarData();
    }
};

// 渲染事件内容的函数
const renderEventContent = (arg: any) => {
    const { event } = arg;
    const { teacher, subject, location, state } = event.extendedProps;

    // 格式化时间为 09:00-13:00 格式
    const startTime = event.start.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const endTime = event.end
        ? event.end.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
          })
        : "";
    const timeRange = endTime ? `${startTime}-${endTime}` : startTime;

    // 根据 state 设置背景颜色
    const backgroundColor = getEventBackgroundColor(state);
    const textColor = state == 1 ? "#ffffff" : "#1f2937";

    return {
        html: `
            <div class="custom-event" style="background-color: ${backgroundColor}; width: 100%;">
                <div class="event-time" style="color: ${textColor};">${timeRange}</div>
                <div class="event-teacher-subject" style="color: ${textColor};">${subject} (${teacher})</div>
                <div class="event-location" style="color: ${textColor};">${location}</div>
            </div>
        `,
    };
};

// 根据状态获取背景颜色
const getEventBackgroundColor = (state: number): string => {
    if (state === 2) return "#bee1af"; // 浅绿色
    if (state === 3) return "#F3E9DC"; // 浅棕色
    return "#123456"; // 默认浅青色
};

// 对外暴露组件的 fetchCalendarData 方法
defineExpose({
    fetchCalendarData,
    baseCalendar,
    getCalendarDateRange,
});
</script>

<style scoped lang="scss">
:deep(.custom-event) {
    padding: 2px 4px;
    border-radius: 4px;

    .event-time {
        font-weight: bold;
        color: #1f2937;
        font-size: 11px;
        margin-bottom: 2px;
    }

    .event-teacher-subject {
        font-weight: normal;
        color: #1f2937;
        font-size: 10px;
        margin-bottom: 1px;
    }

    .event-location {
        font-weight: normal;
        color: #1f2937;
        font-size: 10px;
    }
}

// 移动端优化自定义事件样式
@media (max-width: 480px) {
    :deep(.custom-event) {
        padding: 1px 2px !important;

        .event-time {
            font-size: 9px !important;
            margin-bottom: 1px !important;
        }

        .event-teacher-subject {
            font-size: 8px !important;
            margin-bottom: 0px !important;
        }

        .event-location {
            font-size: 8px !important;
        }
    }
}
</style>
