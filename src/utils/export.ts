import * as XLSX from "xlsx";

// FullCalendar 事件类型（兼容性）
interface FullCalendarEvent {
    title: string;
    start: Date | null;
    end: Date | null;
    extendedProps: any;
}

// 状态映射
const STATE_MAP: Record<number, string> = {
    1: "锁课时",
    2: "未进行",
    3: "已完成",
};

/**
 * 格式化时间
 */
const formatTime = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

/**
 * 格式化日期
 */
const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("zh-CN");
};

/**
 * 方法一：使用 SheetJS 导出 Excel
 */
export const exportToExcelWithSheetJS = (events: FullCalendarEvent[], fileName: string = "日历数据") => {
    try {
        // 准备数据
        const excelData = events.map(event => ({
            日期: formatDate(event.start),
            开始时间: formatTime(event.start),
            结束时间: formatTime(event.end),
            课程: event.extendedProps.subject,
            名称: event.extendedProps.teacher,
            地点: event.extendedProps.location,
            状态: STATE_MAP[event.extendedProps.state] || "未知",
            标题: event.title,
        }));

        // 创建工作簿
        const workbook = XLSX.utils.book_new();

        // 创建工作表
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 设置列宽
        worksheet["!cols"] = [
            { wch: 12 }, // 日期
            { wch: 10 }, // 开始时间
            { wch: 10 }, // 结束时间
            { wch: 20 }, // 课程
            { wch: 15 }, // 教师
            { wch: 15 }, // 地点
            { wch: 10 }, // 状态
            { wch: 30 }, // 标题
        ];

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, "日历数据");

        // 导出文件
        XLSX.writeFile(workbook, `${fileName}.xlsx`);

        return true;
    } catch (error) {
        console.error("SheetJS 导出失败:", error);
        return false;
    }
};

/**
 * 方法二：导出为 CSV 格式
 */
export const exportToCSV = (events: FullCalendarEvent[], fileName: string = "日历数据") => {
    try {
        // CSV 头部
        const headers = ["日期", "开始时间", "结束时间", "课程", "名称", "地点", "状态", "标题"];

        // CSV 数据行
        const rows = events.map(event => [
            formatDate(event.start),
            formatTime(event.start),
            formatTime(event.end),
            event.extendedProps.subject,
            event.extendedProps.teacher,
            event.extendedProps.location,
            STATE_MAP[event.extendedProps.state] || "未知",
            event.title,
        ]);

        // 组合 CSV 内容
        const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");

        // 添加 BOM 以支持中文
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

        // 下载文件
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        return true;
    } catch (error) {
        console.error("CSV 导出失败:", error);
        return false;
    }
};

/**
 * 方法三：导出为 JSON 格式
 */
export const exportToJSON = (events: FullCalendarEvent[], fileName: string = "日历数据") => {
    try {
        const jsonData = events.map(event => ({
            date: formatDate(event.start),
            startTime: formatTime(event.start),
            endTime: formatTime(event.end),
            subject: event.extendedProps.subject,
            name: event.extendedProps.teacher,
            location: event.extendedProps.location,
            status: STATE_MAP[event.extendedProps.state] || "未知",
            title: event.title,
        }));

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: "application/json;charset=utf-8;",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.json`;
        link.click();
        URL.revokeObjectURL(link.href);

        return true;
    } catch (error) {
        console.error("JSON 导出失败:", error);
        return false;
    }
};

/**
 * 方法四：导出为 HTML 表格
 */
export const exportToHTML = (events: FullCalendarEvent[], fileName: string = "日历数据") => {
    try {
        const tableRows = events
            .map(
                event => `
            <tr>
                <td>${formatDate(event.start)}</td>
                <td>${formatTime(event.start)}</td>
                <td>${formatTime(event.end)}</td>
                <td>${event.extendedProps.subject}</td>
                <td>${event.extendedProps.teacher}</td>
                <td>${event.extendedProps.location}</td>
                <td>${STATE_MAP[event.extendedProps.state] || "未知"}</td>
                <td>${event.title}</td>
            </tr>
        `
            )
            .join("");

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${fileName}</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>${fileName}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>开始时间</th>
                            <th>结束时间</th>
                            <th>课程</th>
                            <th>名称</th>
                            <th>地点</th>
                            <th>状态</th>
                            <th>标题</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.html`;
        link.click();
        URL.revokeObjectURL(link.href);

        return true;
    } catch (error) {
        console.error("HTML 导出失败:", error);
        return false;
    }
};

/**
 * 统一导出方法
 */
export const exportCalendarData = (
    events: FullCalendarEvent[],
    format: "excel" | "csv" | "json" | "html" = "excel",
    fileName?: string
) => {
    const defaultFileName = fileName || `日历数据_${new Date().toISOString().split("T")[0]}`;

    switch (format) {
        case "excel":
            return exportToExcelWithSheetJS(events, defaultFileName);
        case "csv":
            return exportToCSV(events, defaultFileName);
        case "json":
            return exportToJSON(events, defaultFileName);
        case "html":
            return exportToHTML(events, defaultFileName);
        default:
            return exportToExcelWithSheetJS(events, defaultFileName);
    }
};
