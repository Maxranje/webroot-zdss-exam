<template>
    <div class="exam-page">
        <!-- 考试中心顶部栏 -->
        <div v-if="examInitialized" class="exam-header">
            <div class="header-content">
                <div class="exam-info">
                    <h2>{{ examInfo.title }}</h2>
                    <span class="exam-type">{{ examInfo.type }}</span>
                </div>
                <div class="exam-progress">
                    <div class="progress-info">
                        <span>{{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
                    </div>
                </div>
                <div class="exam-timer">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatTime(remainingTime) }}</span>
                </div>
            </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="exam-content">
            <div class="question-container">
                <!-- 动态渲染题型组件 -->
                <component
                    :is="currentQuestionComponent"
                    :question="currentQuestion"
                    :answer="currentAnswer"
                    @answer-change="handleAnswerChange" />
            </div>

            <!-- 操作按钮 -->
            <div class="exam-actions">
                <div class="action-left">
                    <el-button v-if="currentQuestionIndex > 0" @click="goToPrevious" size="large">
                        <el-icon><ArrowLeft /></el-icon>
                        上一题
                    </el-button>
                </div>

                <div class="action-right">
                    <el-button
                        v-if="currentQuestionIndex < questions.length - 1"
                        type="primary"
                        @click="goToNext"
                        size="large">
                        下一题
                        <el-icon><ArrowRight /></el-icon>
                    </el-button>

                    <el-button v-else type="success" @click="submitExam" size="large">
                        提交考试
                        <el-icon><Check /></el-icon>
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 提交确认对话框 -->
        <el-dialog v-model="showSubmitDialog" title="提交考试" width="400px" :before-close="handleCloseSubmit">
            <p>确定要提交考试吗？提交后无法修改答案。</p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showSubmitDialog = false">取消</el-button>
                    <el-button type="primary" @click="confirmSubmit">确定提交</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 说明 Modal -->
        <InstructionsModal
            v-model:visible="showInstructions"
            @start="handleStartExam"
            exam-info="雅思模拟考试 A卷" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { ExamItem } from "@/types/exam";

// 题型组件
import ChoiceQuestion from "@/components/Exam/ChoiceQuestion.vue";
import FillBlank from "@/components/Exam/FillBlank.vue";
import Writing from "@/components/Exam/Writing.vue";
import Reading from "@/components/Exam/Reading.vue";
import Matching from "@/components/Exam/Matching.vue";
import Listening from "@/components/Exam/Listening.vue";
import Speaking from "@/components/Exam/Speaking.vue";

const InstructionsModal = defineAsyncComponent(() => import('./ExamInstructions.vue'));

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 显示说明modal
const showInstructions = ref(false);
const examInitialized = ref(false);
const currentExam = ref<ExamItem>();

// 初始化考试
const initExam = async () => {
    try {
        const storedExam = localStorage.getItem('currentExam');
        if (!storedExam) {
            router.replace('/404');
            return;
        }

        currentExam.value = JSON.parse(storedExam);
        
        const result = await authStore.fetchAuthReq('/mapi/napi/exam_init', 'POST', {
            exam_id: currentExam.value?.examId
        });
        if (!result || result.status !== 0) {
            throw new Error(result?.msg || '初始化考试失败');
        }

        if (result.data.status === 1) {
            showInstructions.value = true;
        } else if (result.data.status === 5) {
            examInitialized.value = true;
        } else {
            router.replace('/finish');
        }
    } catch (error: any) {
        router.replace('/error');
    }
};

// 处理开始考试
const handleStartExam = () => {
    showInstructions.value = false;
    examInitialized.value = true;
};

// 防止返回
onMounted(() => {
    history.pushState(null, '', document.URL);
    window.addEventListener('popstate', () => {
        history.pushState(null, '', document.URL);
    });
});

// 考试信息
const examId = route.params.examId as string;
const examInfo = ref({
    title: "雅思模拟考试 A卷",
    type: "综合测试",
});

// 当前题目索引
const currentQuestionIndex = ref(0);

// 考试时间（秒）
const remainingTime = ref(7200); // 2小时

// 提交对话框
const showSubmitDialog = ref(false);

// 题目数据
const questions = ref([
    {
        id: 1,
        type: "choice",
        title: "选择题示例",
        content: "以下哪个选项是正确的？",
        options: [
            { id: "A", text: "选项A" },
            { id: "B", text: "选项B" },
            { id: "C", text: "选项C" },
            { id: "D", text: "选项D" },
        ],
        multiple: false,
    },
    {
        id: 2,
        type: "fill",
        title: "填空题示例",
        content: "请在空白处填入合适的单词：The weather is _____ today.",
        blanks: [{ id: 1, placeholder: "形容词" }],
    },
    {
        id: 3,
        type: "writing",
        title: "写作题示例",
        content: "请写一篇不少于250字的短文，描述你对在线教育的看法。",
        minWords: 250,
        maxWords: 400,
    },
    {
        id: 4,
        type: "reading",
        title: "阅读理解",
        passage: "这里是阅读材料的内容...",
        questions: [
            {
                id: 1,
                question: "根据文章内容，作者的主要观点是什么？",
                options: [
                    { id: "A", text: "观点A" },
                    { id: "B", text: "观点B" },
                    { id: "C", text: "观点C" },
                ],
            },
        ],
    },
    {
        id: 5,
        type: "matching",
        title: "连线题示例",
        leftItems: [
            { id: 1, text: "苹果" },
            { id: 2, text: "香蕉" },
            { id: 3, text: "橙子" },
        ],
        rightItems: [
            { id: "A", text: "Apple" },
            { id: "B", text: "Banana" },
            { id: "C", text: "Orange" },
        ],
    },
    {
        id: 6,
        type: "listening",
        title: "听力题示例",
        audioUrl: "/audio/sample.mp3",
        questions: [
            {
                id: 1,
                question: "说话者提到了什么？",
                options: [
                    { id: "A", text: "选项A" },
                    { id: "B", text: "选项B" },
                    { id: "C", text: "选项C" },
                ],
            },
        ],
    },
    {
        id: 7,
        type: "speaking",
        title: "口语题示例",
        content: "请描述你最喜欢的季节，并说明原因。",
        timeLimit: 180, // 3分钟
    },
]);

// 用户答案
const answers = ref<Record<number, any>>({});

// 计算属性
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const currentAnswer = computed(() => answers.value[currentQuestion.value?.id] || null);

const progressPercentage = computed(() => {
    return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
});

const currentQuestionComponent = computed(() => {
    const componentMap: Record<string, any> = {
        choice: ChoiceQuestion,
        fill: FillBlank,
        writing: Writing,
        reading: Reading,
        matching: Matching,
        listening: Listening,
        speaking: Speaking,
    };
    return componentMap[currentQuestion.value?.type || "choice"] || ChoiceQuestion;
});

// 定时器
let timer: any = null;

// 方法
const startTimer = () => {
    timer = setInterval(() => {
        if (remainingTime.value > 0) {
            remainingTime.value--;
        } else {
            // 时间到，自动提交
            ElMessage.warning("考试时间已到，系统将自动提交");
            submitExam();
        }
    }, 1000);
};

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const handleAnswerChange = (answer: any) => {
    answers.value[currentQuestion.value.id] = answer;
};

const goToPrevious = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
    }
};

const goToNext = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
    }
};

const submitExam = () => {
    showSubmitDialog.value = true;
};

const confirmSubmit = () => {
    // 提交考试逻辑
    showSubmitDialog.value = false;
    ElMessage.success("考试提交成功");

    // 跳转到结果页面或个人中心
    router.push("/profile");
};

const handleCloseSubmit = () => {
    showSubmitDialog.value = false;
};

// 生命周期
onMounted(() => {
    initExam();
    startTimer();
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});

// 页面离开确认
window.addEventListener("beforeunload", e => {
    e.preventDefault();
    e.returnValue = "确定要离开考试页面吗？";
});
</script>

<style scoped lang="scss">
.exam-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
}

.exam-header {
    background-image: -webkit-linear-gradient(right, #650019 0, #002f67 100%);
    color: white;
    padding: 0 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 100;
}

.header-content {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
}

.exam-info {
    display: flex;
    align-items: center;
    gap: 16px;

    h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }

    .exam-type {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
    }
}

.exam-progress {
    display: flex;
    align-items: center;
    gap: 12px;

    .progress-info {
        font-size: 14px;
        font-weight: 500;
    }

    .progress-bar {
        width: 200px;
        height: 6px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
            border-radius: 3px;
            transition: width 0.3s ease;
        }
    }
}

.exam-timer {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.15);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
}

.exam-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    padding: 24px;
}

.question-container {
    flex: 1;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
    // overflow: hidden;
}

.exam-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .action-left,
    .action-right {
        display: flex;
        gap: 12px;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

// 防止用户选择文本
.exam-header {
    user-select: none;
}
</style>
