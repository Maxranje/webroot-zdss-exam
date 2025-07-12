<template>
      <FullCalendar ref="fullCalendar" :options="calendarOptions"/>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'

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

// 响应式屏幕宽度
const screenWidth = ref(window.innerWidth);

// 日历事件数据
const calendarEvents = ref<CalendarEvent[]>([]);

// FullCalendar 实例引用
const fullCalendar = ref<InstanceType<typeof FullCalendar> | null>(null);

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // 初始化时获取日历数据
  fetchCalendarData();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// 获取日历数据的函数
const fetchCalendarData = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8060/mapi/calendar');
    if (!response.ok) {
      throw new Error('网络请求失败');
    }
    const data = await response.json();
    calendarEvents.value = data;
    
    // 更新日历事件
    if (fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi();
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(data);
    }
  } catch (error) {
    console.error('获取日历数据失败:', error);
    // 如果接口请求失败，可以使用默认数据
    const defaultEvents = [
      {
        title: '数学课',
        start: '2025-01-15T08:00:00',
        end: '2025-01-15T09:30:00',
        extendedProps: {
          teacher: '张老师',
          subject: '数学',
          location: '教室A101',
          state: 1
        }
      },
      {
        title: '英语课',
        start: '2025-01-15T10:00:00',
        end: '2025-01-15T11:30:00',
        extendedProps: {
          teacher: '李老师',
          subject: '英语',
          location: '教室B203',
          state: 2
        }
      },
      {
        title: '数学课',
        start: '2025-01-15T14:00:00',
        end: '2025-01-15T15:30:00',
        extendedProps: {
          teacher: '王老师',
          subject: '数学',
          location: '教室A102',
          state: 3
        }
      },
      {
        title: '英语课',
        start: '2025-07-16T09:00:00',
        end: '2025-07-16T10:30:00',
        extendedProps: {
          teacher: '刘老师',
          subject: '英语',
          location: '教室B201',
          state: 1
        }
      },
      {
        title: '数学课',
        start: '2025-07-16T15:00:00',
        end: '2025-07-16T16:30:00',
        extendedProps: {
          teacher: '陈老师',
          subject: '数学',
          location: '教室A103',
          state: 2
        }
      },
      {
        title: '数学课',
        start: '2025-07-16T17:00:00',
        end: '2025-07-16T18:30:00',
        extendedProps: {
          teacher: '陈老师',
          subject: '数学',
          location: '教室A103',
          state: 2
        }
      }
    ];
    
    calendarEvents.value = defaultEvents;
    
    // 更新日历事件
    if (fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi();
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(defaultEvents);
    }
  }
};

// 处理日期变化的函数
const handleDatesSet = (dateInfo: any) => {
  // 当日期范围发生变化时，重新获取数据
  fetchCalendarData();
};

// 根据屏幕宽度动态配置 headerToolbar
const headerToolbarConfig = computed(() => {
  if (screenWidth.value < 480) {
    return {
      left: 'prev,next',
      center: '',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    };
  } else {
    return {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    };
  }
});

const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    headerToolbar: headerToolbarConfig.value,
    height: 'auto',
    aspectRatio: 0.8, // 调整宽高比使格子更高
    locale: 'zh-cn',
    buttonText: {
      today: '今天',
      month: '月',
      week: '周',
      day: '日',
      list: '列表'
    },
    dayMaxEvents: 2,
    moreLinkText: function(num: number) {
      return `+${num} 更多`;
    },
    // 使用响应式的事件数据
    events: calendarEvents.value,
    // 监听日期变化
    datesSet: handleDatesSet,
    eventContent: function(arg: any) {
      const { event } = arg;
      const { teacher, subject, location, state } = event.extendedProps;
      
      // 格式化时间为 09:00-13:00 格式
      const startTime = event.start.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      const endTime = event.end ? event.end.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }) : '';
      const timeRange = endTime ? `${startTime}-${endTime}` : startTime;
      
      // 根据 state 设置背景颜色（浅色主题）
      let backgroundColor = '#87CEEB'; // 默认浅青色
      if (state === 2) {
        backgroundColor = "#90EE90"; // 浅黄色
      } else if (state === 3) {
        backgroundColor = "#FFB6C1"
      }
      
      return {
        html: `
          <div class="custom-event" style="background-color: ${backgroundColor}; width: 100%;">
            <div class="event-time">${timeRange}</div>
            <div class="event-teacher-subject">${subject} (${teacher})</div>
            <div class="event-location">${location}</div>
          </div>
        `
      };
    }
}))
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
  --fc-today-bg-color: #f0f9ff;
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
  background-color: #f0f9ff !important;
}

:deep(.fc-timegrid-col.fc-day-today) {
  background-color: #f0f9ff !important;
}

// 月视图格子高度放大一倍
:deep(.fc-daygrid-day) {
  min-height: 120px !important; // 默认约60px，增加到120px
  height: 120px !important;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 120px !important;
  height: 120px !important;
  padding: 2px !important;
}

:deep(.fc-daygrid-day-events) {
  margin-top: 2px !important;
  margin-bottom: 2px !important;
  min-height: 90px !important; // 为事件留出更多空间
}

:deep(.fc-daygrid-day-top) {
  flex-direction: column !important;
  align-items: flex-start !important;
  padding: 4px !important;
}

// 确保事件在更大的格子中正确显示
:deep(.fc-daygrid-event) {
  margin-bottom: 2px !important;
  min-height: 30px !important; // 事件的最小高度
}

// 移动端优化（屏幕宽度小于480px时）
@media (max-width: 480px) {
  // 隐藏标题栏，为日历内容留出更多空间
  :deep(.fc-header-toolbar) {
    margin-bottom: 0.5em !important;
  }
  
  // 调整按钮大小
  :deep(.fc-button) {
    padding: 0.2em 0.4em !important;
    font-size: 0.8em !important;
  }
  
  // 调整视图选择按钮的显示
  :deep(.fc-button-group) {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 2px !important;
  }
  
  // 优化日期数字显示
  :deep(.fc-daygrid-day-number) {
    font-size: 0.9em !important;
    padding: 2px !important;
  }
  
  // 减小事件字体大小以适应小屏幕
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
  
  // 调整月视图格子在小屏幕上的高度
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