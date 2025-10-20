<template>
    <div class="exam-instructions">
        <div class="instructions-card">
            <h1>考试须知</h1>
            <div class="content">
                <h3>重要提示：</h3>
                <ul>
                    <li>考试过程中请勿刷新或关闭页面，否则可能导致考试数据丢失</li>
                    <li>请确保您的网络连接稳定</li>
                    <li>考试开始后将无法返回，请确保已做好充分准备</li>
                    <li>请提前准备好耳机等必要设备（如有听力和口语考试）</li>
                    <li>考试时间开始后将无法暂停，请合理安排答题时间</li>
                </ul>

                <h3>注意事项：</h3>
                <ul>
                    <li>请独立完成考试，不得查阅任何参考资料</li>
                    <li>系统会自动记录您的作答过程</li>
                    <li>考试结束前请确保所有题目都已完成</li>
                    <li>
                        考试前请检查测试录音设备是否正常
                        <a class="test_recording" href="javascript:void(0)" @click="openRecordingTest">测试录音设备</a>
                    </li>
                </ul>
            </div>

            <div class="actions">
                <el-checkbox v-model="agreed">我已阅读并同意以上考试须知</el-checkbox>
                <el-button type="primary" size="large" :disabled="!agreed" @click="handleStartExam" :loading="loading">
                    开始考试
                </el-button>
            </div>
        </div>

        <!-- 录音测试弹窗 -->
        <el-dialog
            v-model="isRecordingDialogVisible"
            title="录音设备测试"
            width="500px"
            :before-close="handleDialogClose">
            <div class="recording-test-dialog">
                <p class="test-tip">请测试您的录音设备是否正常工作（如有口语考试）</p>

                <!-- 录音权限提示 -->
                <div class="permission-tip" v-if="showPermissionTip">
                    <span>请确保已授予浏览器麦克风访问权限以进行录音</span>
                </div>

                <!-- 录音状态信息 -->
                <div class="recording-info">
                    <span v-if="!isRecording && !hasRecording">点击下方按钮开始录音测试</span>
                    <span v-else-if="isRecording" class="recording-status">正在录音...</span>
                    <span v-else-if="hasRecording">录音已完成，您可以播放或重新录制</span>
                </div>

                <!-- 录音按钮区域 -->
                <div class="recording-button-area">
                    <el-button type="primary" @click="startRecording" :disabled="isRecording" v-if="!hasRecording">
                        开始录音
                    </el-button>

                    <el-button type="danger" @click="stopRecording" :disabled="!isRecording" v-if="isRecording">
                        停止录音
                    </el-button>

                    <el-button
                        type="success"
                        @click="playRecording"
                        :disabled="!hasRecording || isPlaying"
                        v-if="hasRecording">
                        播放录音
                    </el-button>

                    <el-button
                        type="warning"
                        @click="resetRecording"
                        :disabled="isRecording || isPlaying"
                        v-if="hasRecording">
                        重新录制
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";

const agreed = ref(false);
const loading = ref(false);

// 录音相关状态
const isRecording = ref(false);
const hasRecording = ref(false);
const isPlaying = ref(false);
const showPermissionTip = ref(false);
const isRecordingDialogVisible = ref(false);

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioBlob: Blob | null = null;
let audioUrl: string | null = null;
let audioPlayer: HTMLAudioElement | null = null;

const emit = defineEmits(["confirm"]);

// 打开录音测试弹窗
const openRecordingTest = () => {
    isRecordingDialogVisible.value = true;
};

// 请求麦克风权限并开始录音
const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        showPermissionTip.value = false;

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            audioUrl = URL.createObjectURL(audioBlob);
            hasRecording.value = true;
            isRecording.value = false;

            // 停止所有音轨
            stream.getTracks().forEach(track => track.stop());
        };

        isRecording.value = true;
        mediaRecorder.start();

        // 最长录音时间设置为10秒
        setTimeout(() => {
            if (isRecording.value && mediaRecorder) {
                stopRecording();
                ElMessage.info("录音已自动停止（最长10秒）");
            }
        }, 10000);
    } catch (error) {
        showPermissionTip.value = true;
        isRecording.value = false;
        ElMessage.error("无法访问麦克风，请检查权限设置");
        console.error("录音错误:", error);
    }
};

// 停止录音
const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop();
        isRecording.value = false;
    }
};

// 处理弹窗关闭并销毁相关数据
const handleDialogClose = () => {
    // 如果正在录音，先停止录音
    if (isRecording.value) {
        stopRecording();
    }

    // 如果正在播放，先停止播放
    if (isPlaying.value && audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
        isPlaying.value = false;
    }

    // 释放音频URL资源
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = null;
    }

    // 重置录音相关数据
    audioBlob = null;
    audioChunks = [];
    hasRecording.value = false;
    mediaRecorder = null;

    isRecordingDialogVisible.value = false;
};

// 组件卸载时清理
onUnmounted(() => {
    // 清理资源
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }
    if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop();
    }
});

// 播放录音
const playRecording = () => {
    if (!audioUrl) return;

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer = null;
    }

    audioPlayer = new Audio(audioUrl);
    isPlaying.value = true;

    audioPlayer.play().catch(error => {
        console.error("播放错误:", error);
        ElMessage.error("播放失败");
        isPlaying.value = false;
    });

    audioPlayer.onended = () => {
        isPlaying.value = false;
    };
};

// 重置录音
const resetRecording = () => {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }

    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = null;
    }

    audioBlob = null;
    hasRecording.value = false;
    isPlaying.value = false;
};

// 开始考试
const handleStartExam = async () => {
    if (!agreed.value) {
        ElMessage.warning("请先阅读并同意考试须知");
        return;
    }

    loading.value = true;
    try {
        // 用户要求：移除接口请求，直接确认
        emit("confirm");
    } catch (error: any) {
        ElMessage.error(error?.message || "操作失败，请重试");
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
.exam-instructions {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fa;
    padding: 24px;
}

.instructions-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 32px;
    max-width: 800px;
    width: 100%;

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 32px;
        font-weight: 600;
    }

    .content {
        margin-bottom: 32px;

        h3 {
            color: #333;
            margin: 24px 0 16px;
            font-weight: 600;
        }

        ul {
            padding-left: 20px;

            li {
                margin-bottom: 12px;
                color: #666;
                line-height: 1.6;
            }
        }

        p {
            color: #666;
            line-height: 1.6;
        }

        .recording-test-button-area {
            margin-top: 24px;
            text-align: center;
        }

        // 优化录音测试链接样式
        .test_recording {
            color: #409eff;
            text-decoration: none;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 8px;
            display: inline-block;
            transition: all 0.3s ease;
            font-weight: 600;
            &:hover {
                transform: translateY(-1px);
                text-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
            }
        }
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #eee;
    }
}

// 录音测试弹窗样式
.recording-test-dialog {
    padding: 20px;
    text-align: center;

    .test-tip {
        color: #333;
        margin-bottom: 16px;
        font-weight: 600;
    }

    .permission-tip {
        color: #ff7875;
        margin-bottom: 16px;
        padding: 8px 16px;
        background: #fff1f0;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #ffccc7;
    }

    .recording-info {
        text-align: center;
        margin: 20px 0;
        color: #666;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        .recording-status {
            color: #ff7875;
            font-weight: 600;
        }
    }

    .recording-button-area {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 16px;
    }
}
</style>
