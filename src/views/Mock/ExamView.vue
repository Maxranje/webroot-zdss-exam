<template>
    <div class="exam-page">
        <!-- 考试须知页面 -->
        <ExamInstructions v-if="showInstructions" @confirm="handleInstructionsConfirm" />

        <!-- 考试中心顶部栏 -->
        <div v-else-if="examInitialized" class="exam-header">
            <div class="header-content">
                <div class="exam-info">
                    <img src="/img/logo.png" alt="Logo" class="logo" />
                    <span class="exam-type">{{ topBarInfo.type }}</span>
                </div>
                <div class="header-right">
                    <!-- 计时器 -->
                    <div class="exam-timer">
                        <el-icon><Clock /></el-icon>
                        <span>{{ formatTime(expireTime) }}</span>
                    </div>
                    <!-- 已完成题目数量 -->
                    <div class="question-count" v-if="currentExam?.type != 2">
                        <span>{{ currentQuestion?.index || 0 }} / {{ currentExam?.questionTotal || 0 }}</span>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="exam-actions">
                        <div class="action-left">
                            <el-button :disabled="!hasPreviousQuestion" @click="goToPrevious" size="large">
                                上一题
                            </el-button>
                        </div>

                        <div class="action-right">
                            <el-button
                                :type="hasNextQuestion ? 'primary' : 'success'"
                                @click="hasNextQuestion ? goToNext() : submitExam()"
                                size="large">
                                {{ hasNextQuestion ? "下一题" : "交卷" }}
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 题目内容区域 -->
        <div v-if="examInitialized" class="exam-content">
            <div class="question-container" v-if="currentQuestion">
                <!-- 动态渲染题型组件 -->
                <div v-if="isReadingType" class="reading-layout">
                    <div class="reading-meta" v-html="currentQuestion.meta.content"></div>
                    <div class="reading-content">
                        <component
                            :is="currentQuestionComponent"
                            :question="currentQuestion"
                            :studentAnswer="currentStudentAnswer"
                            @answer-change="handleAnswerChange" />
                    </div>
                </div>
                <div v-else-if="isListeningType" class="listening-layout">
                    <div class="listening-meta">
                        <component
                            :is="Listening"
                            :meta="currentQuestion.meta.content"
                            :meta-id="currentQuestion.metaId"
                            :is-played="listeningShow"
                            @audio-played="handleAudioPlayed" />
                    </div>
                    <div class="listening-content">
                        <component
                            :is="currentQuestionComponent"
                            v-show="listeningShow"
                            :question="currentQuestion"
                            :studentAnswer="currentStudentAnswer"
                            @answer-change="handleAnswerChange" />
                    </div>
                </div>
                <div v-else class="normal-content">
                    <component
                        :is="currentQuestionComponent"
                        :question="currentQuestion"
                        :exam="currentExam"
                        :studentAnswer="currentStudentAnswer"
                        @answer-change="handleAnswerChange" />
                </div>
            </div>
            <div v-else class="loading-container">
                <el-loading v-loading="loading">加载试题中...</el-loading>
            </div>
        </div>

        <!-- 提交确认对话框 -->
        <el-dialog v-model="showSubmitDialog" title="提交考试" width="400px" :before-close="handleCloseSubmit">
            <p>确定要提交考试吗？提交后无法修改。</p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showSubmitDialog = false">取消</el-button>
                    <el-button type="primary" @click="submitExam">确定提交</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElLoading } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { ExamItem, QuestionItem, FinishQuestionItem, StudentAnswerItem, MetaItem } from "@/types/exam";

// 题型组件
import ChoiceQuestion from "@/components/Exam/Choice.vue";
import FillBlank from "@/components/Exam/FillBlank.vue";
import Writing from "@/components/Exam/Writing.vue";
import Listening from "@/components/Exam/Listening.vue";
import Speaking from "@/components/Exam/Speaking.vue";
import ExamInstructions from "./ExamInstructions.vue";

const router = useRouter();
const authStore = useAuthStore();

// 状态管理
const showInstructions = ref(true); // 考试须知是否显示
const examInitialized = ref(false); // 考试是否初始化完成
const currentExam = ref<ExamItem>(); // 当前考试信息
const currentQuestion = ref<QuestionItem>(); // 当前题目信息
const currentStudentAnswer = ref<StudentAnswerItem[]>(); // 当前题目答案

const questionList = ref<QuestionItem[]>([]); // 题目列表
const finishedQuestionList = ref<FinishQuestionItem[]>([]); // 已做完的题目列表
const metaList = ref<MetaItem[]>([]); // 元数据列表
const latQuestionIndex = ref(1); // 当前题目索引
const expireTime = ref(0); // 考试耗时
const spendQuestionTime = ref(0); // 单个试题的考试时间

const showSubmitDialog = ref(false); // 提交确认对话框是否显示
const loading = ref(false); // 加载状态
const hasPreviousQuestion = ref(false); // 是否有上一题
const hasNextQuestion = ref(false); // 是否有下一题
const playedMetaIds = ref<Set<number>>(new Set()); // 已播放过的metaId集合

// 处理考试须知确认
const handleInstructionsConfirm = async () => {
    try {
        loading.value = true;
        await initExam();
        showInstructions.value = false;
        examInitialized.value = true;
        startTimer();
    } catch (error) {
        console.log("初始化考试失败, 请重试或联系监考老师", error);
        ElMessage.error((error as any).message || "初始化考试失败, 请重试或联系监考老师");
    } finally {
        loading.value = false;
    }
};

// 初始化考试
const initExam = async () => {
    const storedExam = localStorage.getItem("currentExam");
    if (!storedExam) {
        router.replace("/404");
        return;
    }

    currentExam.value = JSON.parse(storedExam);

    const result = await authStore.fetchAuthReq("/mapi/napi/exam_init", "POST", {
        exam_id: currentExam.value?.examId,
        sign: currentExam.value?.sign,
    });

    if (!result) {
        throw new Error("初始化考试失败");
    }

    // 处理错误码
    if (result.status == 402) {
        router.replace("/finish");
        return;
    } else if (result.status != 0) {
        throw new Error(result.msg || "初始化考试失败!");
    }

    // 填充
    if (result.data.paperType && currentExam.value) {
        currentExam.value.type = result.data.paperType;
    }

    if (currentExam.value?.type == 2) {
        topBarInfo.value.type = "评估测验";
    }

    // 获取所有试题和考试信息
    await fetchExam();
};

// 获取所有试题
const fetchExam = async () => {
    const result = await authStore.fetchAuthReq("/mapi/napi/exam_get", "POST", {
        exam_id: currentExam.value?.examId,
    });

    if (!result) {
        throw new Error("获取试题失败");
    }

    // 处理错误码
    if (result.status === 402) {
        router.replace("/finish");
        return;
    } else if (result.status === 405) {
        router.replace("/error");
        return;
    }

    if (result.status !== 0) {
        throw new Error(result?.msg || "获取试题失败");
    }

    const { currentQid, questions, totalQuestion, metas, expireTime: apiExpireTime } = result.data;
    metaList.value = metas;
    questionList.value = questions;
    expireTime.value = apiExpireTime;

    // 更新题目数
    if (currentExam.value) {
        currentExam.value.questionTotal = totalQuestion;
    }
    // 初始化题目列表并记录已作答的试题
    finishedQuestionList.value = [];
    questionList.value.forEach((question: QuestionItem) => {
        // 如果存在学生答案，则标记为已完成
        if (question.studentAnswer && question.studentAnswer.length > 0) {
            finishedQuestionAdd(question.qid);
        }
    });

    // 设置当前题目
    await setCurrentQuestion(currentQid);
};

// 设置当前题目
const setCurrentQuestion = async (qid: number) => {
    const question = questionList.value.find(q => q.qid === qid);
    if (!question) {
        throw new Error("题目不存在");
    }
    currentQuestion.value = question;
    // 如metaId > 0 , 则从metalist中找到meta
    if (currentQuestion.value.metaId > 0) {
        const meta = metaList.value.find(m => m.id === currentQuestion.value?.metaId);
        if (meta) {
            currentQuestion.value.meta = meta;
        }
    }
    // 更新index, 如果在已完成列表中, 则更新index
    const finishedQuestion = finishedQuestionList.value.find(fq => fq.qid === qid);
    if (finishedQuestion) {
        currentQuestion.value.index = finishedQuestion.index;
    } else {
        currentQuestion.value.index = latQuestionIndex.value;
    }

    // 更新是否有上一题和下一题的状态
    updateQuestionNavigationStatus();

    // 重置当前题目学生答案
    const studentAnswer = question.studentAnswer.length > 0 ? question.studentAnswer : [];
    currentStudentAnswer.value = studentAnswer;
    spendQuestionTime.value = 0;
};

// 更新题目导航状态
const updateQuestionNavigationStatus = () => {
    if (!currentQuestion.value?.qid || questionList.value.length === 0) {
        hasPreviousQuestion.value = false;
        hasNextQuestion.value = false;
        return;
    }

    // 上一题有没有
    const previousQid = selectPreviousQid();
    console.log("previousQid", previousQid);
    if (previousQid) {
        hasPreviousQuestion.value = true;
    } else {
        hasPreviousQuestion.value = false;
    }

    hasNextQuestion.value = true;
    // 如果全做完了,  并且是最后一题
    if (
        finishedQuestionList.value.length >= (currentExam.value?.questionTotal || 0) &&
        currentQuestion.value?.qid == finishedQuestionList.value[finishedQuestionList.value.length - 1]?.qid
    ) {
        hasNextQuestion.value = false;
    }
};

// 已做过题放到完成列表中
const finishedQuestionAdd = (qid: number) => {
    finishedQuestionList.value.push({
        index: latQuestionIndex.value,
        qid,
    });
    latQuestionIndex.value++;
};

// 提交答案
const submitAnswer = async () => {
    if (currentExam.value?.type !== 2 && !hasAnswerChanged()) {
        return null;
    }

    // 如果未作答则不允许提交
    if (!currentStudentAnswer.value || currentStudentAnswer.value.length === 0) {
        throw new Error("未作答无法提交");
    }
    // 判断answercontent是否有为空的
    if (currentStudentAnswer.value.some(answer => !answer.answerContent)) {
        throw new Error("答案内容不能存在为空选项");
    }

    const result = await authStore.fetchAuthReq("/mapi/napi/exam_save", "POST", {
        qid: currentQuestion.value?.qid,
        exam_id: currentExam.value?.examId,
        student_answers: currentStudentAnswer.value,
        spend_time: spendQuestionTime.value,
        expire_time: expireTime.value,
    });

    if (!result) {
        throw new Error("提交失败请重试");
    }

    // 处理错误码
    if (result.status == 402) {
        router.replace("/finish");
        return null;
    } else if (result.status !== 0) {
        throw new Error(result?.msg || "提交失败请重试");
    }

    // 将当前题目添加到已完成列表
    if (currentQuestion.value?.qid && !finishedQuestionList.value.some(q => q.qid === currentQuestion.value?.qid)) {
        await finishedQuestionAdd(currentQuestion.value?.qid);
    }

    // 把currentStudentAnswer 信息保存到questionlist中对应qid中
    if (currentStudentAnswer.value && currentQuestion.value?.qid) {
        const existingIndex = questionList.value.findIndex(q => q.qid === currentQuestion.value?.qid);
        if (existingIndex >= 0 && currentStudentAnswer.value) {
            questionList.value[existingIndex].studentAnswer = [...currentStudentAnswer.value];
        }
    }

    return result;
};

// 检查学员答案是否有修改
const hasAnswerChanged = (): boolean => {
    const qid = currentQuestion.value?.qid;
    if (!qid) return false;

    // 如果题目不在已完成列表中，需要提交
    if (!finishedQuestionList.value.some(q => q.qid === qid)) {
        return true;
    }

    // 如果题目在已完成列表中，但答案有改变，需要提交
    const questionIndex = questionList.value.findIndex(q => q.qid === qid);
    if (questionIndex >= 0) {
        const storedAnswer = questionList.value[questionIndex].studentAnswer;
        // 简单比较答案是否有变化
        return JSON.stringify(storedAnswer) !== JSON.stringify(currentStudentAnswer.value);
    }

    return false;
};

// 保存答案并尝试获取下一题
const goToNext = async () => {
    loading.value = true;
    try {
        const result = await submitAnswer();
        // 提交成功返回level, 则根据level 选择下一题
        const level = result && result.data && result.data.level ? result.data.level : 1;
        if (level < 0) {
            // 没有下一题了
            hasNextQuestion.value = false;
            return;
        }
        const nextQid = await selectNextQuestion(level);
        spendQuestionTime.value = 0;
        if (nextQid <= 0) {
            showSubmitDialog.value = true; // 展示弹窗
            hasNextQuestion.value = false;
        } else {
            await setCurrentQuestion(nextQid);
        }
    } catch (error: any) {
        ElMessage.error(error.message || "操作失败，请重试");
    } finally {
        loading.value = false;
    }
};

// 选择下一题 返回qid number
const selectNextQuestion = async (level: number = 1): Promise<number> => {
    // 从历史找
    const finishedIndex = finishedQuestionList.value.findIndex(q => q.qid === currentQuestion.value?.qid);
    if (finishedIndex >= 0 && finishedIndex < finishedQuestionList.value.length - 1) {
        return finishedQuestionList.value[finishedIndex + 1].qid;
    }
    // 不在历史, 从列表中拉取, 常规考试
    if (currentExam.value?.type == 1) {
        // 判断是否答完了
        if (finishedQuestionList.value.length >= (currentExam.value?.questionTotal || 0)) {
            return 0;
        }
        // 从列表中拉取下一题
        const currentIndex = questionList.value.findIndex(q => q.qid === currentQuestion.value?.qid);
        if (currentIndex < questionList.value.length - 1) {
            return questionList.value[currentIndex + 1].qid;
        }
    }
    // 如果是access类型考试，根据难度选择下一题
    if (currentExam.value?.type == 2) {
        // 先查找当前level未作答的题目
        let availableQuestions = questionList.value.filter(
            q => q.level === level && !finishedQuestionList.value.some(fq => fq.qid === q.qid)
        );

        // 如果当前level没有可用题目，按顺序查找更大level的题目（level从1-5）
        let currentSearchLevel = level;
        while (availableQuestions.length === 0 && currentSearchLevel < 5) {
            currentSearchLevel++;
            availableQuestions = questionList.value.filter(
                q => q.level === currentSearchLevel && !finishedQuestionList.value.some(fq => fq.qid === q.qid)
            );
        }

        // 如果有符合条件的题目，顺序获取第一个
        if (availableQuestions.length > 0) {
            return availableQuestions[0].qid;
        }
    }
    return 0;
};

// 获取上一题的qid
const selectPreviousQid = () => {
    //从finishlist列表判断, 判断当前题目是否在finishedQuestionList列表中, 如果在, 则返回当前题目之前的题目, 如果不在返回最后一个元素, 如果没有则返回null
    const currentIndex = finishedQuestionList.value.findIndex(q => q.qid === currentQuestion.value?.qid);
    if (currentIndex == 0) {
        return null;
    } else if (currentIndex >= 1) {
        return finishedQuestionList.value[currentIndex - 1].qid;
    } else if (currentIndex <= -1 && finishedQuestionList.value.length > 0) {
        return finishedQuestionList.value[finishedQuestionList.value.length - 1].qid;
    } else {
        return null;
    }
};

// 上一题
const goToPrevious = async () => {
    const previousQid = selectPreviousQid();
    if (previousQid) {
        await setCurrentQuestion(previousQid);
        hasNextQuestion.value = true;
    }
};

// 确认提交
const submitExam = async () => {
    try {
        loading.value = true;
        const result = await authStore.fetchAuthReq("/mapi/napi/exam_submit", "POST", {
            exam_id: currentExam.value?.examId,
            expire_time: expireTime.value,
        });

        if (!result) {
            throw new Error("提交考试失败");
        }

        if (result.status == 402) {
            router.replace("/finish");
            return;
        } else if (result.status != 0) {
            throw new Error(result?.msg || "提交试卷失败,请重试");
        }

        showSubmitDialog.value = false;

        // 保存考试信息到localStorage，供finish页面使用
        localStorage.setItem(
            "examResult",
            JSON.stringify({
                expireTime: (currentExam.value?.expireTime || 3600) - expireTime.value,
                questionTotal: finishedQuestionList.value.length,
            })
        );

        // 删除考试分析数据缓存，强制下次重新获取
        localStorage.removeItem("examAnalysisData");

        router.replace("/finish");
    } catch (error: any) {
        ElMessage.error(error.message || "提交考试失败");
    } finally {
        loading.value = false;
    }
};
// 考试信息
const topBarInfo = ref({
    title: "在线考试",
    type: "综合测试",
});

// 音频试题是否可以展示
const listeningShow = computed(() => {
    let isShow =
        playedMetaIds.value.has(Number(currentQuestion.value?.meta?.id) || 0) ||
        (currentQuestion.value?.meta.metaType == 2 && currentQuestion.value?.studentAnswer.length > 0);
    if (isShow) {
        playedMetaIds.value.add(Number(currentQuestion.value?.meta?.id) || 0);
        return true;
    }
    return false;
});

// 判断是否为阅读类型题目（需要左右布局）
const isReadingType = computed(() => {
    // 如果meta不为空 && metaType为2 为文字
    return (currentQuestion.value?.meta?.content || "").length > 0 && (currentQuestion.value?.meta.metaType || 0) == 1;
});

// 判断是否为听力类型题目（需要先听一个音频后在进行布局）
const isListeningType = computed(() => {
    // 如果meta不为空 && metaType为2 为文字
    return (currentQuestion.value?.meta?.content || "").length > 0 && (currentQuestion.value?.meta.metaType || 0) == 2;
});

// 根据题型选择对应的组件
const currentQuestionComponent = computed(() => {
    const typeMap: Record<string, any> = {
        1: ChoiceQuestion, // 单选
        2: ChoiceQuestion, // 多选
        3: ChoiceQuestion, // 判断
        4: FillBlank, // 填空
        5: Writing, // 简答
        6: Writing, // 写作
        7: Speaking, // 说
    };
    return typeMap[currentQuestion.value?.type || "1"] || ChoiceQuestion;
});

// 定时器
let timer: any = null;

// 方法
const startTimer = () => {
    timer = setInterval(() => {
        if (expireTime.value > 0) {
            expireTime.value--;
            // 当前题所花费时间
            spendQuestionTime.value++;

            // 时间还有3分钟给出提示
            if (expireTime.value == 180) {
                ElMessage.warning("考试时间还有3分钟，考试结束系统将自动提交试卷, 请考生留意时间");
            }
        } else {
            // 时间到，自动提交
            ElMessage.warning("考试时间已到，系统将自动提交");
            console.log("考试时间已到，系统将自动提交");
            console.log("当前题所花费时间", expireTime.value);
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

// 处理答案变化
const handleAnswerChange = async (answer: any) => {
    currentStudentAnswer.value = answer;
};

// 处理音频播放完成事件
const handleAudioPlayed = (metaId: number) => {
    playedMetaIds.value.add(metaId);
};

const handleCloseSubmit = () => {
    showSubmitDialog.value = false;
};

// 生命周期
onMounted(() => {
    // 防止返回
    history.pushState(null, "", document.URL);
    window.addEventListener("popstate", () => {
        history.pushState(null, "", document.URL);
    });

    // 页面离开确认
    window.addEventListener("beforeunload", e => {
        e.preventDefault();
        return (e.returnValue = "确定要离开考试页面吗？");
    });
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
    localStorage.removeItem("exam");
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
    padding: 0 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    user-select: none;
    z-index: 100;
}

.header-content {
    height: 120px;
    display: flex;
    padding: 0 24px;
    align-items: center;
    width: 100%;
}

.exam-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-right: auto;

    .logo {
        height: 40px;
        width: auto;
        object-fit: contain;
    }

    .exam-type {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
    }
}

.header-right {
    display: flex;
    align-items: center;
    gap: 24px;
}

.question-count {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
}

.exam-actions {
    display: flex;
    gap: 12px;
    background: transparent;

    .action-left,
    .action-right {
        display: flex;
    }

    .el-button {
        height: 36px;
        padding: 0 16px;
        font-size: 14px;
    }
}

.exam-timer {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
}

.exam-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
}

.question-container {
    flex: 1;
    background: white;
    overflow-y: auto;
}

.loading-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

// 阅读类型题目的左右布局
.reading-layout {
    display: flex;
    height: 100%;
    min-height: 500px;

    .reading-meta {
        width: 50%;
        padding: 4rem;
        font-size: 16px;
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
        overflow-y: auto;
    }

    .reading-content {
        flex: 1;
        padding: 1% 3%;
        overflow-y: auto;
    }
}

.listening-layout {
    display: flex;
    height: 100%;
    min-height: 500px;

    .listening-meta {
        width: 50%;
        padding: 4rem;
        font-size: 16px;
        background-color: #f8f9fa;
        border-right: 1px solid #e9ecef;
        overflow-y: auto;
    }

    .listening-content {
        flex: 1;
        padding: 1% 3%;
        overflow-y: auto;
    }
}

.normal-content {
    padding: 1% 2%;
    width: 60%;
    margin: 0 auto;
    overflow-y: auto;
}

// 响应式设计
@media (max-width: 768px) {
    .header-content {
        height: auto;
        flex-direction: column;
        padding: 16px 0;
    }

    .exam-info {
        margin-right: 0;
        margin-bottom: 16px;
    }

    .header-right {
        flex-direction: column;
        gap: 12px;
        width: 100%;
    }

    .question-count {
        width: 100%;
        justify-content: center;
    }

    .exam-actions {
        flex-direction: column;
        gap: 12px;
        width: 100%;

        .action-left,
        .action-right {
            width: 100%;
            justify-content: center;
        }
    }

    .exam-timer {
        width: 100%;
        justify-content: center;
    }

    .exam-content {
        padding: 16px;
    }

    .reading-layout {
        flex-direction: column;

        .reading-meta {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e9ecef;
            margin-bottom: 16px;
        }
    }
}
</style>
