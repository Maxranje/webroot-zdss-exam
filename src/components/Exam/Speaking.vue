<template>
    <div class="speaking-question">
        <div class="question-content">
            <!-- 题目内容 -->
            <h3 class="question-title" v-html="question.content"></h3>

            <!-- 录音权限提示 -->
            <div class="permission-tip">
                <span>1. 请确保已授予浏览器麦克风访问权限以进行录音</span>
                <span>2. 录音后请先上传录音文件,再跳转下一题,否则录音会丢失</span>
                <span>3. 录音无法重复上传,请确认录音无误后再进行操作</span>
            </div>

            <!-- 录音区域 -->
            <div class="recording-area" v-if="!audioUploaded">
                <div class="recording-info">
                    <span v-if="!isRecording && !hasRecording">点击下方按钮开始录音（最长1分钟）</span>
                    <span v-else-if="isRecording" class="recording-status">
                        <el-icon class="recording-icon"><RefreshRight /></el-icon>
                        正在录音中...
                    </span>
                    <span v-else-if="hasRecording">录音已完成，您可以播放或重新录制</span>
                </div>

                <!-- 录音计时器 -->
                <div v-if="isRecording || recordingTime > 0" class="recording-timer">
                    <el-progress type="circle" :percentage="(recordingTime / timeLimit) * 100" :stroke-width="6">
                        <span>{{ formatTime(recordingTime) }}</span>
                    </el-progress>
                </div>

                <!-- 录音按钮区域 -->
                <div class="recording-button-area">
                    <el-button
                        v-if="!isRecording && !hasRecording"
                        class="record-button"
                        type="danger"
                        circle
                        @click="startRecording"
                        :disabled="isRecording">
                        <el-icon><Mic /></el-icon>
                    </el-button>

                    <el-button
                        v-else-if="isRecording"
                        class="record-button"
                        type="danger"
                        circle
                        @click="stopRecording">
                        <el-icon><SwitchButton /></el-icon>
                    </el-button>
                </div>

                <!-- 录音波形可视化 -->
                <div v-if="isRecording" class="waveform-visualization">
                    <div class="waveform-container">
                        <div
                            v-for="(height, index) in waveFormData"
                            :key="index"
                            class="wave-bar"
                            :style="{ height: `${height}px` }"></div>
                    </div>
                </div>

                <!-- 录音操作按钮 -->
                <div v-if="hasRecording && !audioUploaded" class="recording-actions">
                    <el-button @click="playRecording">播放录音</el-button>
                    <el-button @click="deleteRecording">删除录音</el-button>
                    <el-button type="primary" @click="confirmRecording">确认提交</el-button>
                </div>
            </div>

            <!-- 录音已上传状态 -->
            <div class="recording-area uploaded" v-else>
                <div class="upload-success">
                    <el-icon class="success-icon"><Check /></el-icon>
                    <span>录音已提交成功</span>
                </div>
                <el-button @click="playRecording" style="margin-top: 16px">播放录音</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { QuestionItem, StudentAnswerItem, ExamItem } from "@/types/exam";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
    question: QuestionItem;
    studentAnswer?: StudentAnswerItem[];
    exam?: ExamItem;
}>();

const emit = defineEmits<{
    "answer-change": [answer: StudentAnswerItem[]];
}>();
const authStore = useAuthStore();

// 录音相关状态
const isRecording = ref(false);
const hasRecording = ref(false);
const audioUploaded = ref(false);
const recordingTime = ref(0);
const timeLimit = ref(60); // 最长1分钟
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioBlob = ref<Blob | null>(null);
const waveFormData = ref<number[]>([]);
let recorderTimer: number | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let animationId: number | null = null;
let audioStream: MediaStream | null = null;

// 初始化音频上下文
const initAudioContext = async () => {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // 检查音频上下文状态，如果是suspended则尝试恢复
            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            // 初始化波形数据
            waveFormData.value = Array(32).fill(10);
        } catch (error) {
            console.error("初始化音频上下文失败:", error);
            throw new Error("无法初始化音频系统");
        }
    } else if (audioContext.state === "suspended") {
        // 如果音频上下文已存在但处于暂停状态，尝试恢复
        try {
            await audioContext.resume();
        } catch (error) {
            console.error("恢复音频上下文失败:", error);
            throw new Error("无法恢复音频系统");
        }
    }
};

// 清理录音资源
const cleanupRecording = () => {
    try {
        // 停止媒体录制器
        if (mediaRecorder.value) {
            if (mediaRecorder.value.state !== "inactive") {
                try {
                    mediaRecorder.value.stop();
                } catch (stopError) {
                    console.warn("停止媒体录制器时出错:", stopError);
                }
            }
            mediaRecorder.value = null;
        }

        // 停止音轨
        if (audioStream) {
            audioStream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (trackError) {
                    console.warn("停止音轨时出错:", trackError);
                }
            });
            audioStream = null;
        }

        // 清除定时器
        if (recorderTimer) {
            clearInterval(recorderTimer);
            recorderTimer = null;
        }

        // 停止动画
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // 重置状态
        isRecording.value = false;
        recordingTime.value = 0;
    } catch (error) {
        console.error("清理录音资源时出错:", error);
    }
};

// 开始录音
const startRecording = async () => {
    try {
        // 先清理可能存在的录音资源
        cleanupRecording();

        // 清除之前的录音数据
        audioBlob.value = null;
        hasRecording.value = false;

        // 初始化音频上下文
        await initAudioContext();

        // 请求麦克风权限
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        // 创建音频源和连接分析器
        if (audioContext && analyser) {
            const source = audioContext.createMediaStreamSource(audioStream);
            source.connect(analyser);
        } else {
            throw new Error("音频上下文或分析器未初始化");
        }

        // 创建媒体录制器 - 使用webm格式以提高兼容性
        mediaRecorder.value = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
        const audioChunks: Blob[] = [];

        mediaRecorder.value.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.value.onstop = () => {
            audioBlob.value = new Blob(audioChunks, { type: "audio/webm" });
            hasRecording.value = true;
            cleanupRecording();
        };

        mediaRecorder.value.start();
        isRecording.value = true;
        recordingTime.value = 0;

        // 启动计时器
        recorderTimer = window.setInterval(() => {
            recordingTime.value++;
            if (recordingTime.value >= timeLimit.value) {
                stopRecording();
                ElMessage.warning("已达到最长录音时间限制（1分钟）");
            }
        }, 1000);

        // 启动波形动画
        updateWaveform();
    } catch (error) {
        console.error("录音错误:", error);

        // 详细的错误提示
        if (error instanceof DOMException && error.name === "NotAllowedError") {
            ElMessage.error("请授权浏览器访问您的麦克风以进行录音");
        } else if (error instanceof DOMException && error.name === "NotFoundError") {
            ElMessage.error("未检测到可用的麦克风设备");
        } else {
            ElMessage.error("启动录音失败，请重试");
        }

        // 确保状态正确重置
        cleanupRecording();
    }
};

// 停止录音
const stopRecording = () => {
    try {
        if (
            mediaRecorder.value &&
            (mediaRecorder.value.state === "recording" || mediaRecorder.value.state === "paused")
        ) {
            mediaRecorder.value.stop();
        }
    } catch (error) {
        console.error("停止录音错误:", error);
        ElMessage.error("停止录音时出现错误");
    }
};

// 播放录音
const playRecording = async () => {
    if (!audioBlob.value) {
        ElMessage.warning("没有可播放的录音");
        return;
    }

    try {
        // 确保音频上下文已初始化并处于运行状态
        if (!audioContext) {
            await initAudioContext();
        } else if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        // 创建临时URL
        const audioUrl = URL.createObjectURL(audioBlob.value);
        const audio = new Audio(audioUrl);

        // 播放结束后释放URL
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

        // 播放录音
        await audio.play();
    } catch (error) {
        console.error("播放录音错误:", error);

        // 详细的错误提示
        if (error instanceof DOMException && error.name === "NotAllowedError") {
            ElMessage.error("浏览器不允许自动播放音频，请手动触发播放");
        } else if (error instanceof DOMException && error.name === "AbortError") {
            ElMessage.error("播放被中止");
        } else {
            ElMessage.error("播放录音失败，请重试");
        }
    }
};

// 删除录音
const deleteRecording = () => {
    audioBlob.value = null;
    hasRecording.value = false;
    ElMessage.success("录音已删除");
};

// 确认提交录音
const confirmRecording = async () => {
    if (!audioBlob.value) {
        ElMessage.warning("没有可提交的录音");
        return;
    }

    try {
        // 显示确认提示框
        await ElMessageBox.confirm("确认提交录音？提交后将无法修改。", "确认提交", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        });

        // 创建FormData对象
        const formData = new FormData();
        formData.append("qid", String(props.question.qid));
        formData.append("audioBlob", audioBlob.value, "recording.webm");
        formData.append("examid", props.exam?.examId ? String(props.exam.examId) : "");
        // 发送文件上传请求 - 直接传入formData作为body参数
        const result = await authStore.fetchAuthReq("/mapi/napi/exam_upload", "POST", formData);

        if (!result) {
            throw new Error("上传失败，网络异常, 请重试");
        }
        if (result.status !== 0) {
            throw new Error("上传失败，错误: " + result.msg);
        }
        // 检查返回的audioPath是否不为空
        if (result.data && result.data.audioPath) {
            // 发送答案变化事件，使用audioPath作为content
            emit("answer-change", [
                {
                    id: 0, // 添加必需的id字段，设置为0
                    qid: props.question.qid,
                    answerId: props.question.qid, // 使用qid作为answerId
                    answerContent: result.data.audioPath,
                    reviewContent: "",
                    score: 0,
                },
            ]);

            audioUploaded.value = true;
            ElMessage.success("录音已提交成功");
        } else {
            throw new Error("上传失败，未返回有效的音频路径");
        }
    } catch (error) {
        // 如果是用户取消操作，不显示错误信息
        if (error !== "cancel") {
            console.error("提交录音错误:", error);
            ElMessage.error("录音提交失败，请稍后重试");
        }
    }
};

// 更新波形动画 - 增加错误处理和状态检查
const updateWaveform = () => {
    if (!analyser || !dataArray || !audioContext) {
        console.warn("波形动画：缺少必要的音频组件");
        return;
    }

    // 检查音频上下文状态
    if (audioContext.state !== "running") {
        console.warn("波形动画：音频上下文未运行");
        return;
    }

    const update = () => {
        if (!analyser || !dataArray || !isRecording.value) return;

        try {
            analyser.getByteFrequencyData(dataArray);

            // 生成波形数据
            const newWaveForm: number[] = [];
            for (let i = 0; i < 32; i++) {
                // 从dataArray中采样
                const value = dataArray[Math.floor(i * (dataArray.length / 32))];
                // 将0-255范围映射到0-80px
                newWaveForm.push(Math.min(value * 0.3, 80));
            }

            waveFormData.value = newWaveForm;
        } catch (error) {
            console.error("更新波形数据失败:", error);
        }

        if (isRecording.value) {
            animationId = requestAnimationFrame(update);
        }
    };

    animationId = requestAnimationFrame(update);
};

// 格式化时间
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 监听父组件传递的答案变化
watch(
    () => props.studentAnswer,
    newAnswer => {
        if (newAnswer && newAnswer.length > 0) {
            // 这里可以根据需要处理已有的学生答案
            // 例如检查是否已经上传过录音
        }
    },
    { deep: true }
);

// 清理资源
onUnmounted(() => {
    cleanupRecording();

    if (audioContext) {
        audioContext.close();
    }
});

// 在组件挂载时初始化
onMounted(() => {
    // 检查是否已经有答案
    if (props.studentAnswer && props.studentAnswer.length > 0) {
        // 标记为已上传，进入页面已经上传过音频则不能再次录音
        audioUploaded.value = true;
        hasRecording.value = false; // 清空本地录音状态，确保只能播放
    }

    // 添加浏览器权限提示检查
    if ("permissions" in navigator) {
        navigator.permissions
            .query({ name: "microphone" as PermissionName })
            .then(result => {
                if (result.state === "denied") {
                    ElMessage.warning("麦克风权限已被拒绝，请在浏览器设置中启用");
                } else if (result.state === "prompt") {
                    ElMessage.info("录制时需要访问您的麦克风");
                }
            })
            .catch(() => {
                // 某些浏览器可能不支持permissions API
                ElMessage.info("浏览器不支持麦克风权限检查, 请手动检查麦克风权限");
            });
    }
});
</script>

<style scoped lang="scss">
.speaking-question {
    width: 100%;
    height: 100%;

    .question-content {
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 400px;
    }

    .question-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
        text-align: center;
        line-height: 1.6;
    }

    .permission-tip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: #fffbe6;
        border: 1px solid #ffe58f;
        border-radius: 6px;
        margin-bottom: 24px;
        font-size: 14px;
        color: #ad6800;
        width: 100%;
        max-width: 600px;
        text-align: left;

        span {
            color: #faad14;
            display: block;
        }
    }

    .recording-area {
        width: 100%;
        max-width: 600px;
        padding: 24px;
        background-color: #f0f9ff;
        border-radius: 12px;
        border: 2px solid #bae7ff;
        transition: all 0.3s ease;

        &.uploaded {
            background-color: #f6ffed;
            border-color: #b7eb8f;
            text-align: center;
        }

        .recording-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 14px;
            color: #666;

            .recording-status {
                color: #ff4d4f;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;

                .recording-icon {
                    animation: spin 1s linear infinite;
                }
            }
        }

        .recording-timer {
            display: flex;
            justify-content: center;
            margin: 20px 0;

            .el-progress {
                width: 120px !important;
                height: 120px !important;

                .el-progress-circle__primary,
                .el-progress-circle__path {
                    stroke-width: 6;
                }

                .el-progress__text {
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    color: #1890ff !important;
                }
            }
        }

        .recording-button-area {
            text-align: center;
            margin: 20px 0;

            .record-button {
                width: 100px;
                height: 100px;
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto;
                transition: all 0.3s ease;

                &:hover {
                    transform: scale(1.1);
                }

                &:active {
                    transform: scale(0.95);
                }

                .el-icon {
                    font-size: 40px;
                }
            }
        }

        .waveform-visualization {
            margin: 20px 0;
            height: 100px;

            .waveform-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 4px;
                height: 100%;

                .wave-bar {
                    width: 4px;
                    background: linear-gradient(180deg, #1890ff 0%, #0050b3 100%);
                    border-radius: 2px;
                    transition: height 0.05s ease;
                }
            }
        }

        .recording-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;

            .el-button {
                min-width: 120px;
                padding: 8px 16px;
            }
        }

        .upload-success {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #52c41a;
            font-size: 16px;
            font-weight: 600;

            .success-icon {
                font-size: 24px;
            }
        }
    }
}

// 动画效果
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

// 响应式设计
@media (max-width: 768px) {
    .speaking-question {
        .question-content {
            padding: 16px;
        }

        .question-title {
            font-size: 16px;
        }

        .permission-tip {
            font-size: 12px;
            padding: 8px 12px;
        }

        .recording-area {
            padding: 16px;

            .recording-button-area {
                .record-button {
                    width: 80px;
                    height: 80px;

                    .el-icon {
                        font-size: 32px;
                    }
                }
            }

            .recording-timer {
                .el-progress {
                    width: 100px !important;
                    height: 100px !important;

                    .el-progress__text {
                        font-size: 16px !important;
                    }
                }
            }

            .recording-actions {
                .el-button {
                    min-width: 100px;
                    padding: 6px 12px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
