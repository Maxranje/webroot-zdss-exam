<template>
  <div class="listening-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="audio-section">
      <div class="audio-player">
        <div class="player-header">
          <h4>音频材料</h4>
          <div class="audio-info">
            <span class="duration">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="player-controls">
          <el-button
            :type="isPlaying ? 'warning' : 'primary'"
            circle
            size="large"
            @click="togglePlay"
            :loading="loading">
            <el-icon>
              <VideoPlay v-if="!isPlaying" />
              <VideoPause v-else />
            </el-icon>
          </el-button>

          <div class="progress-area">
            <div class="waveform-container" @click="seekTo">
              <div class="waveform">
                <div
                  v-for="i in 50"
                  :key="i"
                  :class="['waveform-bar', { active: i <= (currentTime / duration) * 50 }]"
                  :style="{ height: `${Math.random() * 40 + 10}px` }"></div>
              </div>
              <div class="progress-line" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
            </div>

            <el-slider
              v-model="sliderValue"
              :max="100"
              :show-tooltip="false"
              @input="onSliderChange"
              class="audio-slider" />
          </div>

          <div class="volume-control">
            <el-icon><MuteNotification /></el-icon>
            <el-slider
              v-model="volume"
              :max="100"
              :show-tooltip="false"
              @input="changeVolume"
              style="width: 80px; margin-left: 8px" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="hasStartedPlaying" class="questions-section">
      <div class="questions-header">
        <h4>听力题目</h4>
        <span class="questions-count">共 {{ question.questions.length }} 题</span>
      </div>

      <div class="questions-list">
        <div v-for="(q, index) in question.questions" :key="q.id" class="question-item">
          <div class="question-content">
            <div class="question-index">{{ index + 1 }}.</div>
            <div class="question-text">{{ q.question }}</div>
          </div>

          <div class="question-options">
            <div
              v-for="option in q.options"
              :key="option.id"
              :class="['option-item', { selected: isSelected(q.id, option.id) }]"
              @click="selectOption(q.id, option.id)">
              <div class="option-indicator">
                <div class="radio">
                  <div v-if="isSelected(q.id, option.id)" class="radio-dot"></div>
                </div>
              </div>
              <div class="option-content">
                <span class="option-label">{{ option.id }}.</span>
                <span class="option-text">{{ option.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="waiting-message">
      <el-icon><Headset /></el-icon>
      <h4>请先播放音频</h4>
      <p>点击播放按钮开始听音频，播放后题目将显示</p>
    </div>

    <audio
      ref="audioRef"
      :src="question.audioUrl"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      preload="metadata"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";

interface QuestionOption {
  id: string;
  text: string;
}

interface ListeningQuestion {
  id: number;
  question: string;
  options: QuestionOption[];
}

interface Question {
  id: number;
  title: string;
  audioUrl: string;
  questions: ListeningQuestion[];
}

interface Props {
  question: Question;
  answer?: Record<number, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: Record<number, string>];
}>();

const audioRef = ref<HTMLAudioElement>();
const answers = ref<Record<number, string>>({});
const isPlaying = ref(false);
const loading = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(80);
const hasStartedPlaying = ref(false);

// 初始化答案
if (props.answer) {
  answers.value = { ...props.answer };
}

const sliderValue = computed({
  get: () => (duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0),
  set: (value: number) => {
    if (audioRef.value && duration.value > 0) {
      audioRef.value.currentTime = (value / 100) * duration.value;
    }
  },
});

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const togglePlay = async () => {
  if (!audioRef.value) return;

  try {
    loading.value = true;

    if (isPlaying.value) {
      audioRef.value.pause();
    } else {
      await audioRef.value.play();
      hasStartedPlaying.value = true;
    }
  } catch (error) {
    ElMessage.error("音频播放失败");
    console.error("Audio play error:", error);
  } finally {
    loading.value = false;
  }
};

const onLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration;
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime;
  }
};

const onEnded = () => {
  isPlaying.value = false;
  ElMessage.success("音频播放完成");
};

const seekTo = (event: MouseEvent) => {
  if (!audioRef.value || duration.value === 0) return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  audioRef.value.currentTime = percent * duration.value;
};

const onSliderChange = (value: number | number[]) => {
  const numValue = Array.isArray(value) ? value[0] : value;
  if (audioRef.value && duration.value > 0) {
    audioRef.value.currentTime = (numValue / 100) * duration.value;
  }
};

const changeVolume = (value: number | number[]) => {
  const numValue = Array.isArray(value) ? value[0] : value;
  if (audioRef.value) {
    audioRef.value.volume = numValue / 100;
  }
};

const isSelected = (questionId: number, optionId: string) => {
  return answers.value[questionId] === optionId;
};

const selectOption = (questionId: number, optionId: string) => {
  answers.value[questionId] = optionId;
  emit("answer-change", { ...answers.value });
};

// 监听播放状态
watch(
  () => audioRef.value,
  audio => {
    if (audio) {
      const handlePlay = () => {
        isPlaying.value = true;
      };
      const handlePause = () => {
        isPlaying.value = false;
      };

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);

      // 设置初始音量
      audio.volume = volume.value / 100;

      onUnmounted(() => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
      });
    }
  },
  { immediate: true }
);

// 监听question变化，重置状态
watch(
  () => props.question.id,
  () => {
    answers.value = props.answer || {};
    hasStartedPlaying.value = false;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.listening-question {
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

.audio-section {
  margin-bottom: 32px;
}

.audio-player {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e4e7ed;

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h4 {
      margin: 0;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: "🎧";
      }
    }

    .audio-info {
      font-size: 14px;
      color: #606266;
      font-family: monospace;
    }
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 20px;

    .progress-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .volume-control {
      display: flex;
      align-items: center;
      color: #606266;
    }
  }
}

.waveform-container {
  position: relative;
  height: 60px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;

  .waveform {
    display: flex;
    align-items: end;
    height: 100%;
    padding: 8px;
    gap: 2px;

    .waveform-bar {
      flex: 1;
      background: #d1d5db;
      border-radius: 2px;
      transition: all 0.3s ease;

      &.active {
        background: linear-gradient(to top, #409eff, #67c23a);
      }
    }
  }

  .progress-line {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: rgba(64, 158, 255, 0.2);
    pointer-events: none;
    transition: width 0.1s ease;
  }
}

.audio-slider {
  :deep(.el-slider__runway) {
    background-color: #e4e7ed;
  }

  :deep(.el-slider__bar) {
    background: linear-gradient(90deg, #409eff, #67c23a);
  }
}

.questions-section {
  flex: 1;
  overflow-y: auto;

  .questions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #ecf5ff, #e6f7ff);
    border-radius: 8px;

    h4 {
      margin: 0;
      color: #409eff;
    }

    .questions-count {
      font-size: 14px;
      color: #606266;
    }
  }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.question-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e4e7ed;

  .question-content {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;

    .question-index {
      font-weight: 600;
      color: #409eff;
      margin-right: 8px;
      font-size: 16px;
    }

    .question-text {
      flex: 1;
      font-size: 15px;
      color: #303133;
      line-height: 1.6;
    }
  }

  .question-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 24px;
  }
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.selected {
    border-color: #409eff;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  }

  .option-indicator {
    margin-right: 12px;

    .radio {
      width: 16px;
      height: 16px;
      border: 2px solid #dcdfe6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      .radio-dot {
        width: 8px;
        height: 8px;
        background: #409eff;
        border-radius: 50%;
      }
    }
  }

  &.selected .radio {
    border-color: #409eff;
  }

  .option-content {
    display: flex;
    align-items: center;
    flex: 1;

    .option-label {
      font-weight: 600;
      color: #409eff;
      margin-right: 8px;
    }

    .option-text {
      font-size: 14px;
      color: #303133;
    }
  }
}

.waiting-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  text-align: center;

  .el-icon {
    font-size: 64px;
    margin-bottom: 16px;
    color: #d1d5db;
  }

  h4 {
    margin: 0 0 8px 0;
    color: #606266;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
