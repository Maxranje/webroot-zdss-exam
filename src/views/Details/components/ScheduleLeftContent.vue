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

// 类型定义
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

interface EventRenderArg {
    event: {
        start: Date;
        end?: Date;
        extendedProps: {
            teacher: string;
            subject: string;
            location: string;
            state: number;
        };
    };
}

// 常量定义
const EVENT_STATES = {
    DEFAULT: 1,
    COMPLETED: 2,
    CANCELLED: 3,
} as const;

const EVENT_COLORS = {
    [EVENT_STATES.DEFAULT]: "#123456",
    [EVENT_STATES.COMPLETED]: "#90EE90",
    [EVENT_STATES.CANCELLED]: "#f6d5ba",
} as const;

// 组合式函数
const useScheduleLeftContent = () => {
    const authStore = useAuthStore();

    // 响应式数据
    const calendarEvents = ref<CalendarEvent[]>([]);
    const defaultCalendarEvents = ref<CalendarEvent[]>([]);
    const baseCalendar = ref<InstanceType<typeof BaseCalendar> | null>(null);

    // 工具函数
    const getDateRange = () => {
        const calendarApi = baseCalendar.value?.getApi();
        if (calendarApi) {
            const view = calendarApi.view;
            return {
                startDate: view.activeStart.toISOString().split("T")[0],
                endDate: view.activeEnd.toISOString().split("T")[0],
            };
        }

        // 如果日历还未初始化，使用当前月份
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            startDate: startOfMonth.toISOString().split("T")[0],
            endDate: endOfMonth.toISOString().split("T")[0],
        };
    };

    const updateCalendarEvents = (events: CalendarEvent[]) => {
        const calendarApi = baseCalendar.value?.getApi();
        if (calendarApi) {
            calendarApi.removeAllEvents();
            calendarApi.addEventSource(events);
        }
    };

    const getEventBackgroundColor = (state: number): string => {
        return EVENT_COLORS[state as keyof typeof EVENT_COLORS] || EVENT_COLORS[EVENT_STATES.DEFAULT];
    };

    const formatTimeRange = (start: Date, end?: Date): string => {
        const startTime = start.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        if (!end) return startTime;

        const endTime = end.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        return `${startTime}-${endTime}`;
    };

    // 主要方法
    const fetchCalendarData = async () => {
        try {
            const { startDate, endDate } = getDateRange();

            const result = await authStore.fetchAuthReq("/mapi/napi/calendar_teacher", "POST", {
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

    const handleDatesSet = (dateInfo: any) => {
        // 当日期范围发生变化时，重新获取数据
        fetchCalendarData();
    };

    const renderEventContent = (arg: EventRenderArg) => {
        const { event } = arg;
        const { teacher, subject, location, state } = event.extendedProps;
        const timeRange = formatTimeRange(event.start, event.end);
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

    return {
        calendarEvents,
        defaultCalendarEvents,
        baseCalendar,
        fetchCalendarData,
        handleDatesSet,
        renderEventContent,
    };
};

// 使用组合式函数
const { calendarEvents, defaultCalendarEvents, baseCalendar, fetchCalendarData, handleDatesSet, renderEventContent } =
    useScheduleLeftContent();
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
