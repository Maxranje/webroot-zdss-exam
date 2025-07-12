# FullCalendar 前端导出功能指南

## 概述

本项目实现了多种前端导出功能，可以将 FullCalendar 当前可视范围内展现的数据导出为不同格式，**无需依赖后台服务**。

## 支持的导出格式

### 1. Excel 格式 (.xlsx)
- 使用 SheetJS 库
- 支持中文
- 自动设置列宽
- 包含完整的日历事件信息

### 2. CSV 格式 (.csv)
- 纯文本格式
- 支持中文（添加 BOM）
- 兼容 Excel 打开
- 文件体积小

### 3. JSON 格式 (.json)
- 结构化数据
- 便于程序处理
- 包含所有事件属性

### 4. HTML 格式 (.html)
- 带样式的表格
- 可直接在浏览器中查看
- 支持打印

## 使用方法

### 在界面中使用

1. **选择类型和项目**：先选择类型（班级/学生/教师）和具体项目
2. **查看日历数据**：日历会显示当前时间段的数据
3. **选择导出格式**：
   - 点击"导出Excel"按钮：使用后台导出（需要网络）
   - 点击"前端导出"下拉菜单：选择导出格式（无需网络）

### 在代码中使用

```typescript
import { exportCalendarData } from "@/utils/excelExport";

// 获取 FullCalendar 事件
const calendarApi = fullCalendarRef.value?.getApi();
const events = calendarApi.getEvents();

// 导出为 Excel
exportCalendarData(events, "excel", "我的日历数据");

// 导出为 CSV
exportCalendarData(events, "csv", "我的日历数据");

// 导出为 JSON
exportCalendarData(events, "json", "我的日历数据");

// 导出为 HTML
exportCalendarData(events, "html", "我的日历数据");
```

## 导出的数据字段

所有格式都包含以下字段：

| 字段名 | 说明 | 示例 |
|--------|------|------|
| 日期 | 事件日期 | 2024-01-15 |
| 开始时间 | 事件开始时间 | 09:00 |
| 结束时间 | 事件结束时间 | 10:30 |
| 课程 | 课程名称 | 英语口语 |
| 教师 | 授课教师 | 张老师 |
| 地点 | 上课地点 | 教室A101 |
| 状态 | 事件状态 | 进行中/已完成/已结转 |
| 标题 | 事件标题 | 英语口语课 |

## 技术实现

### 核心依赖

```json
{
  "xlsx": "^0.18.5"
}
```

### 主要功能模块

1. **`src/utils/excelExport.ts`**：导出工具函数
2. **`src/views/Platform/MainView.vue`**：导出界面实现

### 关键技术点

1. **获取 FullCalendar 事件**：
   ```typescript
   const calendarApi = fullCalendarRef.value?.getApi();
   const events = calendarApi.getEvents();
   ```

2. **获取可视范围**：
   ```typescript
   const { startDate, endDate } = getCalendarDateRange();
   ```

3. **数据格式化**：
   ```typescript
   const startTime = event.start?.toLocaleTimeString("zh-CN", {
       hour: "2-digit",
       minute: "2-digit",
       hour12: false,
   });
   ```

## 优势特点

### 1. 无需后台依赖
- 完全在前端处理
- 减少服务器负载
- 提高响应速度

### 2. 支持多种格式
- 满足不同使用场景
- 兼容性好
- 文件体积优化

### 3. 数据准确性
- 导出当前可视范围数据
- 与界面显示完全一致
- 支持不同日历视图

### 4. 用户体验
- 一键导出
- 实时反馈
- 错误处理完善

## 注意事项

1. **数据量限制**：大量数据导出可能影响浏览器性能
2. **浏览器兼容性**：需要现代浏览器支持
3. **文件命名**：自动生成包含日期范围的文件名
4. **中文支持**：所有格式都支持中文显示

## 扩展功能

### 自定义导出字段

可以修改 `excelExport.ts` 中的数据处理逻辑来添加或修改导出字段：

```typescript
const excelData = events.map(event => ({
    "自定义字段": event.extendedProps.customField,
    // ... 其他字段
}));
```

### 添加导出格式

在 `exportCalendarData` 函数中添加新的格式支持：

```typescript
case "pdf":
    return exportToPDF(events, fileName);
```

### 批量导出

可以实现多时间段或多种类型的批量导出功能。

## 故障排除

### 常见问题

1. **导出失败**：检查浏览器是否支持 Blob 和 File API
2. **中文乱码**：确保添加了 BOM 头
3. **数据为空**：确认当前时间段内有数据
4. **文件无法下载**：检查浏览器下载设置

### 调试方法

```typescript
// 检查事件数据
console.log("Events:", events);

// 检查导出结果
const success = exportCalendarData(events, "excel", "test");
console.log("Export result:", success);
```

## 总结

前端导出功能为 FullCalendar 提供了强大的数据导出能力，支持多种格式，无需后台依赖，用户体验良好。通过合理的架构设计和错误处理，确保了功能的稳定性和可扩展性。 