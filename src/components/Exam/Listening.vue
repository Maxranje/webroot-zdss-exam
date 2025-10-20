<template>
    <div class="listening-question">
        <div class="audio-player-tips">
            <el-icon><WarningFilled /></el-icon>
            <p>听力音频仅能播放一次, 请做好听力准备后再进行播放, 播放后会展示右侧试题, 进行作答</p>
        </div>
        <div class="audio-player">
            <div class="player-header">
                <h4>
                    <el-icon><Headset /></el-icon>
                    音频播放
                </h4>
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
                    :loading="loading"
                    :disabled="props.isPlayed">
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
        <div v-if="props.isPlayed" class="played-message">
            <p>该音频已播完，请对右侧试题作答</p>
        </div>
    </div>

    <audio
        ref="audioRef"
        :src="props.meta"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        preload="metadata"></audio>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import { ElMessage } from "element-plus";

interface Props {
    meta: string;
    metaId: number;
    isPlayed: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    "audio-played": [metaId: number];
}>();

const audioRef = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const loading = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(80);

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

    // 如果已经播放过，则不允许二次播放
    if (props.isPlayed && !isPlaying.value) {
        ElMessage.warning("该音频已播放过，不允许二次播放");
        return;
    }

    try {
        loading.value = true;

        if (isPlaying.value) {
            audioRef.value.pause();
        } else {
            await audioRef.value.play();
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
    // 触发音频播放完成事件
    emit("audio-played", props.metaId);
};

const seekTo = (event: MouseEvent) => {
    if (!audioRef.value || duration.value === 0 || props.isPlayed) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audioRef.value.currentTime = percent * duration.value;
};

const onSliderChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    if (audioRef.value && duration.value > 0 && !props.isPlayed) {
        audioRef.value.currentTime = (numValue / 100) * duration.value;
    }
};

const changeVolume = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    if (audioRef.value) {
        audioRef.value.volume = numValue / 100;
    }
};

// 在setup顶层定义事件处理函数
const handlePlay = () => {
    isPlaying.value = true;
};

const handlePause = () => {
    isPlaying.value = false;
};

// 监听播放状态
watch(
    () => audioRef.value,
    audio => {
        if (audio) {
            audio.addEventListener("play", handlePlay);
            audio.addEventListener("pause", handlePause);

            // 设置初始音量
            audio.volume = volume.value / 100;
        }
    },
    { immediate: true }
);

// 在setup函数顶层使用onUnmounted，确保使用相同的函数引用
onUnmounted(() => {
    if (audioRef.value) {
        audioRef.value.removeEventListener("play", handlePlay);
        audioRef.value.removeEventListener("pause", handlePause);
    }
});

// 监听meta变化，重置状态
watch(
    () => props.metaId,
    () => {
        isPlaying.value = false;
        currentTime.value = 0;
        duration.value = 0;
    },
    { immediate: true }
);
</script>

<style scoped lang="scss">
.listening-question {
    padding: 2rem 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.audio-player-tips {
    color: #909399;
    align-content: center;
    display: flex;
    align-items: center;
    justify-content: center;
    .el-icon {
        font-size: 24px;
        font-weight: 600;
    }
    p {
        font-size: 14px;
        margin-left: 12px;
    }
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

.played-message {
    align-items: center;
    color: #909399;
    text-align: center;

    p {
        margin: 0;
        font-size: 14px;
    }
}
</style>
