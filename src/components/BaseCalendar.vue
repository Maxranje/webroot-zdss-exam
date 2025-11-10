<template>
    <FullCalendar ref="fullCalendar" :options="mergedOptions" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

// 定义 props
interface Props {
    events?: any[];
    initialView?: string;
    height?: string | number;
    aspectRatio?: number;
    weekends?: boolean;
    dayMaxEvents?: number | boolean;
    customOptions?: any;
    eventContent?: (arg: any) => any;
    datesSet?: (dateInfo: any) => void;
}

const props = withDefaults(defineProps<Props>(), {
    events: () => [],
    initialView: "dayGridMonth",
    height: "auto",
    aspectRatio: 0.8,
    weekends: true,
    dayMaxEvents: 1,
    customOptions: () => ({}),
});

// 暴露给父组件的方法
defineExpose({
    getApi: () => fullCalendar.value?.getApi(),
    getCalendarRef: () => fullCalendar.value,
});

// 响应式屏幕宽度
const screenWidth = ref(window.innerWidth);

// FullCalendar 实例引用
const fullCalendar = ref<InstanceType<typeof FullCalendar> | null>(null);

// 监听窗口大小变化
const handleResize = () => {
    screenWidth.value = window.innerWidth;
};

onMounted(() => {
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});

// 根据屏幕宽度动态配置 headerToolbar
const headerToolbarConfig = computed(() => {
    if (screenWidth.value < 480) {
        return {
            left: "prev,next",
            center: "",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        };
    } else {
        return {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        };
    }
});

// 合并的日历配置
const mergedOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: props.initialView,
    weekends: props.weekends,
    headerToolbar: headerToolbarConfig.value,
    height: props.height,
    aspectRatio: props.aspectRatio,
    locale: "zh-cn",
    firstDay: 1,
    buttonText: {
        today: "今天",
        month: "月",
        week: "周",
        day: "日",
        list: "列表",
    },
    dayMaxEvents: props.dayMaxEvents,
    moreLinkText: function (num: number) {
        return `+${num} 更多`;
    },
    events: props.events,
    datesSet: props.datesSet,
    eventContent: props.eventContent,
    dateClick: handleDateClick,
    ...props.customOptions, // 允许覆盖默认配置
}));

// 处理日期点击事件
const handleDateClick = (dateInfo: any) => {
    // 点击日期跳转到日视图
    const calendarApi = fullCalendar.value?.getApi();
    if (calendarApi) {
        calendarApi.changeView("timeGridDay", dateInfo.dateStr);
    }
};
</script>

<style scoped lang="scss">
:deep(.fc-event) {
    border: none !important;
    padding: 0 !important;
    border-radius: 4px !important;
    font-size: 12px !important;
    line-height: 1.2 !important;
    background: transparent !important;
    margin-bottom: 1px !important;

    .fc-event-main {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
    }
}

:deep(.fc-daygrid-event) {
    white-space: normal !important;
    height: auto !important;
    min-height: 50px !important;
    margin-bottom: 1px !important;
}

:deep(.fc-timegrid-event) {
    .fc-event-main {
        padding: 4px !important;
    }
}

:deep(.fc-list-event) {
    .fc-event-title {
        font-weight: 600 !important;
    }
}

:deep(.fc-toolbar-title) {
    font-size: 1.5rem !important;
    font-weight: 600 !important;
    color: #1f2937 !important;
}

:deep(.fc-button) {
    background-color: #f8fafc !important;
    border-color: #e2e8f0 !important;
    color: #475569 !important;
    font-weight: 500 !important;
    border-width: 1px !important;

    &:hover {
        background-color: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #334155 !important;
        border-width: 1px !important;
    }

    &.fc-button-active {
        background-color: #e2e8f0 !important;
        border-color: #cbd5e1 !important;
        color: #1e293b !important;
        border-width: 1px !important;
    }

    &:focus {
        outline: none !important;
        box-shadow: 0 0 0 1px #3b82f6 !important;
    }
}

:deep(.fc-daygrid-day-number) {
    font-weight: 400 !important;
    color: #374151 !important;
}

:deep(.fc-col-header-cell) {
    background-color: #f9fafb !important;
    font-weight: 400 !important;
    color: #374151 !important;
}

:deep(.fc-daygrid-more-link) {
    color: #6b7280 !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    text-decoration: none !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;

    &:hover {
        background-color: #f3f4f6 !important;
        color: #374151 !important;
    }
}

:deep(.fc-daygrid-day-frame) {
    padding: 1px !important;
}

:deep(.fc-daygrid-day-events) {
    margin-top: 1px !important;
    margin-bottom: 1px !important;
}

:deep(.fc-theme-standard) {
    --fc-page-bg-color: #ffffff;
    --fc-neutral-bg-color: #f8fafc;
    --fc-neutral-text-color: #475569;
    --fc-border-color: #e2e8f0;
    --fc-today-bg-color: #d7e4f7;
    --fc-highlight-color: #e0f2fe;
    --fc-event-bg-color: #e0f2fe;
    --fc-event-border-color: #7dd3fc;
    --fc-event-text-color: #0c4a6e;
    --fc-more-link-bg-color: #f1f5f9;
    --fc-more-link-text-color: #475569;
    --fc-list-event-hover-bg-color: #f8fafc;
}

:deep(.fc-today-button) {
    background-color: #dbeafe !important;
    border-color: #93c5fd !important;
    color: #1e40af !important;
}

:deep(.fc-daygrid-day.fc-day-today) {
    background-color: #d7e4f7 !important;
}

:deep(.fc-timegrid-col.fc-day-today) {
    background-color: #d7e4f7 !important;
}

// 月视图格子高度放大一倍
:deep(.fc-daygrid-day) {
    min-height: 120px !important;
    height: 120px !important;
    overflow: hidden !important;
}

:deep(.fc-daygrid-day-frame) {
    min-height: 120px !important;
    height: 120px !important;
    padding: 2px !important;
    overflow: hidden !important;
}

:deep(.fc-daygrid-day-events) {
    margin-top: 2px !important;
    margin-bottom: 2px !important;
    min-height: 90px !important;
    overflow: hidden !important;
}

:deep(.fc-daygrid-day-top) {
    flex-direction: column !important;
    align-items: flex-start !important;
    padding: 4px !important;
    overflow: hidden !important;
}

:deep(.fc-daygrid-event) {
    margin-bottom: 2px !important;
    min-height: 30px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

:deep(.fc-event-title) {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}

:deep(.fc-daygrid-day-number) {
    cursor: pointer !important;
}

// 移动端优化
@media (max-width: 480px) {
    :deep(.fc-header-toolbar) {
        margin-bottom: 0.5em !important;
    }

    :deep(.fc-button) {
        padding: 0.2em 0.4em !important;
        font-size: 0.8em !important;
    }

    :deep(.fc-button-group) {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 2px !important;
    }

    :deep(.fc-daygrid-day-number) {
        font-size: 0.9em !important;
        padding: 2px !important;
    }

    :deep(.fc-daygrid-day) {
        min-height: 100px !important;
        height: 100px !important;
    }

    :deep(.fc-daygrid-day-frame) {
        min-height: 100px !important;
        height: 100px !important;
    }

    :deep(.fc-daygrid-day-events) {
        min-height: 75px !important;
    }
}
</style>
