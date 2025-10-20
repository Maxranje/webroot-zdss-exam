export const formatDurationTime = (seconds: number, unit: boolean) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    // 如果hours>0 则拼接否则不拼接
    let ret: string = "";
    if (days > 0) {
        ret = `${days.toString().padStart(2, "0")}`;
        ret += unit ? `天` : `:`;
    }
    if (hours > 0 || (days > 0 && hours == 0)) {
        ret += `${hours.toString().padStart(2, "0")}`;
        ret += unit ? `时` : `:`;
    }
    if (minutes >= 0) {
        ret += `${minutes.toString().padStart(2, "0")}`;
        ret += unit ? `分` : `:`;
    }
    if (secs >= 0) {
        ret += `${secs.toString().padStart(2, "0")}`;
        ret += unit ? `秒` : ``;
    }
    return ret || "00:00:00";
};

export const formatDateTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const secs = date.getSeconds();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
