<template>
  <div class="speaking-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="question-content">
      <div class="question-prompt">
        <h4>题目要求</h4>
        <p class="question-text">{{ question.content }}</p>
      </div>
    </div>

    <div class="recording-area">
      <div class="recording-controls">
        <div class="timer-display">
          <div class="time-remaining">
            <span class="time-label">剩余时间</span>
            <span class="time-value" :class="{ warning: timeRemaining <= 30 }">
              {{ formatTime(timeRemaining) }}
            </span>
          </div>
          <div class="total-time">
            <span class="time-label">总时长</span>
            <span class="time-value">{{ formatTime(question.timeLimit) }}</span>
          </div>
        </div>

        <div class="record-button-area">
          <el-button
            :type="recordingState === 'recording' ? 'danger' : 'primary'"
            :size="'large'"
            circle
            @click="toggleRecording"
            :disabled="recordingState === 'finished'"
            class="record-button">
            <el-icon size="24">
              <Microphone v-if="recordingState === 'idle'" />
              <VideoPlay v-else-if="recordingState === 'recording'" />
              <Check v-else />
            </el-icon>
          </el-button>

          <div class="recording-status">
            <span v-if="recordingState === 'idle'">点击开始录音</span>
            <span v-else-if="recordingState === 'recording'" class="recording-text">
              <span class="recording-dot"></span>
              正在录音...
            </span>
            <span v-else class="finished-text">录音完成</span>
          </div>
        </div>

        <div class="recording-actions">
          <el-button v-if="recordingState === 'recording'" @click="stopRecording" type="warning">
            <el-icon><VideoPause /></el-icon>
            结束录音
          </el-button>

          <el-button v-if="recordingState === 'finished'" @click="playRecording" :loading="isPlaying">
            <el-icon><VideoPlay /></el-icon>
            播放录音
          </el-button>

          <el-button v-if="recordingState === 'finished'" @click="resetRecording" type="info">
            <el-icon><RefreshLeft /></el-icon>
            重新录音
          </el-button>
        </div>
      </div>

      <!-- 录音波形可视化 -->
      <div class="waveform-visualization" v-if="recordingState === 'recording'">
        <div class="waveform-container">
          <div
            v-for="i in 40"
            :key="i"
            class="wave-bar"
            :style="{
              height: `${waveformData[i % waveformData.length]}px`,
              animationDelay: `${i * 0.1}s`,
            }"></div>
        </div>
      </div>

      <!-- 录音提示 -->
      <div class="recording-tips" v-if="recordingState === 'idle'">
        <div class="tip-item">
          <el-icon><InfoFilled /></el-icon>
          <span>请确保您的麦克风已启用并工作正常</span>
        </div>
        <div class="tip-item">
          <el-icon><Clock /></el-icon>
          <span>录音时间为 {{ Math.floor(question.timeLimit / 60) }} 分钟，请合理安排答题时间</span>
        </div>
        <div class="tip-item">
          <el-icon><ChatDotRound /></el-icon>
          <span>请清楚地表达您的观点，录音将用于评分</span>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section" v-if="recordingState !== 'idle'">
      <div class="progress-label">录音进度</div>
      <el-progress :percentage="progressPercentage" :color="progressColor" :stroke-width="8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";

interface Question {
  id: number;
  title: string;
  content: string;
  timeLimit: number; // 秒
}

interface Props {
  question: Question;
  answer?: {
    recordingData?: Blob;
    duration?: number;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: { recordingData?: Blob; duration?: number }];
}>();

const recordingState = ref<"idle" | "recording" | "finished">("idle");
const timeRemaining = ref(0);
const isPlaying = ref(false);
const waveformData = ref<number[]>([]);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedBlob = ref<Blob | null>(null);
const recordingStartTime = ref(0);

let timer: any = null;
let animationFrame: any = null;

// 初始化
if (props.answer?.recordingData) {
  recordedBlob.value = props.answer.recordingData;
  recordingState.value = "finished";
}

const progressPercentage = computed(() => {
  if (recordingState.value === "idle") return 0;
  if (recordingState.value === "finished") return 100;
  return ((props.question.timeLimit - timeRemaining.value) / props.question.timeLimit) * 100;
});

const progressColor = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage < 50) return "#409eff";
  if (percentage < 80) return "#e6a23c";
  return "#f56c6c";
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const generateWaveformData = () => {
  waveformData.value = Array.from({ length: 20 }, () => Math.random() * 40 + 10);
};

const startTimer = () => {
  timeRemaining.value = props.question.timeLimit;
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
      // 更新波形数据
      if (recordingState.value === "recording") {
        generateWaveformData();
      }
    } else {
      stopRecording();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const toggleRecording = async () => {
  if (recordingState.value === "idle") {
    await startRecording();
  } else if (recordingState.value === "recording") {
    stopRecording();
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });

    mediaRecorder.value = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.value.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      recordedBlob.value = new Blob(chunks, { type: "audio/webm" });
      const duration = props.question.timeLimit - timeRemaining.value;

      emit("answer-change", {
        recordingData: recordedBlob.value,
        duration: duration,
      });

      // 停止所有音轨
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    recordingState.value = "recording";
    recordingStartTime.value = Date.now();

    startTimer();
    generateWaveformData();

    ElMessage.success("开始录音");
  } catch (error) {
    ElMessage.error("无法访问麦克风，请检查权限设置");
    console.error("Recording error:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === "recording") {
    mediaRecorder.value.stop();
  }

  recordingState.value = "finished";
  stopTimer();

  ElMessage.success("录音结束");
};

const playRecording = async () => {
  if (!recordedBlob.value) return;

  try {
    isPlaying.value = true;
    const audio = new Audio(URL.createObjectURL(recordedBlob.value));

    audio.onended = () => {
      isPlaying.value = false;
    };

    await audio.play();
  } catch (error) {
    ElMessage.error("播放失败");
    isPlaying.value = false;
  }
};

const resetRecording = () => {
  recordingState.value = "idle";
  recordedBlob.value = null;
  timeRemaining.value = 0;
  emit("answer-change", {});
  ElMessage.info("已重置录音");
};

// 监听question变化，重置状态
watch(
  () => props.question.id,
  () => {
    resetRecording();
    if (props.answer?.recordingData) {
      recordedBlob.value = props.answer.recordingData;
      recordingState.value = "finished";
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopTimer();
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});
</script>

<style scoped lang="scss">
.speaking-question {
  padding: 32px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f2f5;

  .question-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }

  .question-number {
    background: linear-gradient(135deg, #409eff, #67c23a);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
}

.question-content {
  margin-bottom: 32px;

  .question-prompt {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    padding: 24px;
    border-radius: 12px;
    border-left: 4px solid #e6a23c;

    h4 {
      margin: 0 0 16px 0;
      color: #e6a23c;
      font-size: 16px;
    }

    .question-text {
      font-size: 16px;
      line-height: 1.8;
      color: #303133;
      margin: 0;
    }
  }
}

.recording-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.recording-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 600px;
}

.timer-display {
  display: flex;
  gap: 32px;

  .time-remaining,
  .total-time {
    text-align: center;

    .time-label {
      display: block;
      font-size: 13px;
      color: #909399;
      margin-bottom: 4px;
    }

    .time-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      font-family: monospace;

      &.warning {
        color: #f56c6c;
        animation: pulse 1s infinite;
      }
    }
  }
}

.record-button-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .record-button {
    width: 80px;
    height: 80px;
    font-size: 32px;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .recording-status {
    font-size: 16px;
    font-weight: 500;

    .recording-text {
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 8px;

      .recording-dot {
        width: 8px;
        height: 8px;
        background: #f56c6c;
        border-radius: 50%;
        animation: pulse 1s infinite;
      }
    }

    .finished-text {
      color: #67c23a;
    }
  }
}

.recording-actions {
  display: flex;
  gap: 12px;
}

.waveform-visualization {
  margin-top: 24px;
  width: 100%;
  max-width: 400px;
}

.waveform-container {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 3px;
  height: 80px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(230, 162, 60, 0.1));
  border-radius: 8px;
  padding: 12px;

  .wave-bar {
    flex: 1;
    max-width: 4px;
    background: linear-gradient(to top, #409eff, #e6a23c);
    border-radius: 2px;
    animation: wave 1s ease-in-out infinite;
  }
}

.recording-tips {
  margin-top: 24px;
  width: 100%;
  max-width: 500px;

  .tip-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f0f9ff;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;

    .el-icon {
      color: #409eff;
      flex-shrink: 0;
    }
  }
}

.progress-section {
  .progress-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
    text-align: center;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}
</style>
