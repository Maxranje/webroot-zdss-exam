<template>
    <div class="exam-finished">
        <div class="finished-container">
            <div class="finished-content">
                <div class="finished-icon">Finished</div>
                <div class="finished-title">考试已完成</div>
                <div class="finished-description">恭喜您完成了本次考试！系统正在评分中，请稍后查看结果。</div>

                <div class="finish-stats">
                    <div class="stat-item">
                        <span class="stat-label">考试时长</span>
                        <span class="stat-value">{{ formatDurationTime(totalTimeSpent, false) }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">作答题目</span>
                        <span class="stat-value">{{ totalQuestions }}题</span>
                    </div>
                </div>

                <div class="finished-actions">
                    <button class="btn-primary" @click="viewExamList">
                        <i class="icon-list"></i>
                        返回考试列表
                    </button>
                </div>
            </div>
            <div class="finished-illustration">
                <div class="illustration-container">
                    <div class="star-icon">⭐</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { formatDurationTime } from "@/utils/tools";
import type { ExamItem } from "@/types/exam";

const router = useRouter();

// 统计数据
const totalTimeSpent = ref(0);
const totalQuestions = ref(0);

// 查看考试列表
const viewExamList = () => {
    router.push("/profile?tab=exam");
};

onMounted(() => {
    // 防止返回
    history.pushState(null, "", document.URL);
    window.addEventListener("popstate", () => {
        history.pushState(null, "", document.URL);
    });

    // 从localStorage获取考试信息
    const storedExam = localStorage.getItem("examResult");
    if (storedExam) {
        const exam: ExamItem = JSON.parse(storedExam);
        // 这里可以根据实际情况设置统计数据
        totalQuestions.value = exam.questionTotal || 0;
        totalTimeSpent.value = exam.expireTime;

        // 清除考试数据
        localStorage.removeItem("examResult");
    }
});
</script>

<style scoped lang="scss">
.exam-finished {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
    padding: 20px;
}

.finished-container {
    max-width: 800px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 60px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 60px 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.finished-content {
    flex: 1;
}

.finished-icon {
    font-size: 100px;
    font-weight: 900;
    color: #48c6ef;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.finished-title {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
}

.finished-description {
    font-size: 18px;
    color: #666;
    margin-bottom: 24px;
    line-height: 1.6;
}

.finish-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 32px;
    padding: 24px 0;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-label {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
}

.finished-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .icon-home,
    .icon-list {
        font-size: 20px;
    }
}

.finished-illustration {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .illustration-container {
        position: relative;
        width: 200px;
        height: 200px;
    }

    .star-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 80px;
        color: #ffd700;
        animation: pulse 2s infinite;
    }

    .check-marks {
        position: absolute;
        width: 100%;
        height: 100%;

        span {
            position: absolute;
            font-size: 40px;
            color: #48c6ef;
            opacity: 0.6;

            &:nth-child(1) {
                top: 20%;
                left: 20%;
                animation: float 3s infinite;
            }

            &:nth-child(2) {
                top: 30%;
                left: 70%;
                animation: float 3s infinite;
            }

            &:nth-child(3) {
                top: 60%;
                right: 20%;
                animation: float 3s infinite 1s;
            }

            &:nth-child(4) {
                bottom: 20%;
                left: 40%;
                animation: float 3s infinite 2s;
            }
        }
    }
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
    }
}

@keyframes float {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .finished-container {
        flex-direction: column-reverse;
        text-align: center;
        padding: 40px 20px;
    }

    .finished-illustration {
        margin-bottom: 30px;
    }

    .finished-icon {
        font-size: 80px;
    }

    .finished-title {
        font-size: 24px;
    }

    .finished-description {
        font-size: 16px;
    }

    .finish-stats {
        flex-direction: column;
        gap: 16px;
    }

    .finished-actions {
        flex-direction: column;
    }
}
</style>
