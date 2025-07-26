<template>
    <BaseCalendar
        ref="baseCalendar"
        :events="calendarEvents"
        :dates-set="handleDatesSet"
        :event-content="renderEventContent" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseCalendar from "@/components/BaseCalendar.vue";
import { useAuthStore } from "@/stores/auth";

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
const defaultCalendarEvents = ref<CalendarEvent[]>([]);

// BaseCalendar 实例引用
const baseCalendar = ref<InstanceType<typeof BaseCalendar> | null>(null);

// 获取auth store
const authStore = useAuthStore();

// 获取日历数据的函数
const fetchCalendarData = async () => {
    try {
        // 获取当前日历的可视范围
        let startDate: string, endDate: string;

        const calendarApi = baseCalendar.value?.getApi();
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

        // 调用认证请求接口
        const result = await authStore.fetchAuthReq("/mapi/napi/calendar_student", "POST", {
            start_date: startDate,
            end_date: endDate,
        });

        if (result.status === 0) {
            if (result.data.lists) {
                calendarEvents.value = result.data.lists;
                updateCalendarEvents(result.data.lists);
            } else {
                calendarEvents.value = defaultCalendarEvents.value;
                updateCalendarEvents(calendarEvents.value);
            }
        } else {
            throw new Error(result.msg || "获取日历数据失败");
        }
    } catch (error) {
        console.error("获取日历数据失败:", error);
        // 如果接口请求失败，使用默认数据
        calendarEvents.value = defaultCalendarEvents.value;
        updateCalendarEvents(calendarEvents.value);
    }
};

// 更新日历事件
const updateCalendarEvents = (events: CalendarEvent[]) => {
    const calendarApi = baseCalendar.value?.getApi();
    if (calendarApi) {
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
    }
};

// 处理日期变化的函数
const handleDatesSet = (dateInfo: any) => {
    // 当日期范围发生变化时，重新获取数据
    fetchCalendarData();
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

    return {
        html: `
            <div class="custom-event" style="background-color: ${backgroundColor}; width: 100%;">
                <div class="event-time">${timeRange}</div>
                <div class="event-teacher-subject">${subject} (${teacher})</div>
                <div class="event-location">${location}</div>
            </div>
        `,
    };
};

// 根据状态获取背景颜色
const getEventBackgroundColor = (state: number): string => {
    if (state === 2) return "#90EE90"; // 浅绿色
    if (state === 3) return "#f6d5ba"; // 浅棕色
    return "#123456"; // 默认浅青色
};
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
