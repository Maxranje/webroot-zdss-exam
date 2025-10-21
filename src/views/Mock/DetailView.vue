<template>
    <div class="detail-view">
        <!-- 顶部导航 -->
        <div class="top-nav">
            <div class="nav-left">
                <img src="/img/logo.png" alt="Logo" class="logo" />
            </div>
            <div class="nav-title">考试报告</div>
            <div class="nav-right">
                <el-button @click="handleBack">返回</el-button>
            </div>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
            <!-- 分数展示（如果有） -->
            <div v-if="examResult?.studentScore !== undefined" class="score-circle">
                <div class="score-value">{{ examResult.studentScore }}</div>
                <div class="score-label">得分</div>
            </div>

            <!-- 试卷信息 -->
            <div class="exam-info">
                <h2>{{ examResult?.paperName || "试卷名称" }}</h2>
                <div class="exam-meta">
                    <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        考试耗时：{{ formatDurationTime(examResult?.studentSpendTime || 0, true) }}
                    </span>
                    <span class="meta-item">
                        <el-icon><Document /></el-icon>
                        考试题数：{{ examResult?.questionTotal || 0 }}题
                    </span>
                    <span class="meta-item" v-if="examResult?.currentLevel != '' && examResult?.type == 2">
                        <el-icon><Document /></el-icon>
                        最终难度: {{ examResult?.currentLevel }}
                    </span>
                </div>
            </div>

            <!-- 题目列表 -->
            <div class="questions-container">
                <div v-for="(question, qIndex) in orderedQuestions" :key="question.qid || qIndex" class="question-item">
                    <!-- 显示材料（仅在第一个相关题目显示） -->
                    <div v-if="showMaterial(qIndex, question)" class="meta-content">
                        <div class="meta-header">
                            <el-icon><Document /></el-icon>
                            <span>材料{{ getMaterialIndex(question.metaId) }}</span>
                        </div>
                        <div
                            v-if="getMetaById(question.metaId)?.metaType === 1"
                            v-html="getMetaById(question.metaId)?.content"
                            class="meta-text"></div>
                        <div v-else-if="getMetaById(question.metaId)?.metaType === 2" class="audio-player">
                            <audio controls :src="getMetaById(question.metaId)?.content">
                                您的浏览器不支持音频播放
                            </audio>
                        </div>
                    </div>

                    <div class="question-header">
                        <span class="question-number">{{ qIndex + 1 }}.</span>
                        <span class="question-type">
                            ({{ getQuestionType(question.type) }} - {{ question.score }}分)
                        </span>
                        <span v-if="question.studentAnswer[0]?.score > 0" class="question-score">
                            [{{ question.studentAnswer[0]?.score }}分]
                        </span>
                    </div>
                    <div class="question-content" v-html="question.content"></div>

                    <!-- 选项 -->
                    <div v-if="isChoiceType(question.type)" class="question-options">
                        <div
                            v-for="(option, optIndex) in question.questionAnswer"
                            :key="optIndex"
                            class="option-item"
                            :class="{
                                selected: isSelected(option.answerId, question.studentAnswer),
                                incorrect:
                                    isSelected(option.answerId, question.studentAnswer) &&
                                    !isCorrectAnswer(option.answerId, question.questionAnswer),
                            }">
                            <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
                            <span class="option-content" v-html="option.answerContent"></span>
                        </div>
                    </div>

                    <!-- 填空题答案 -->
                    <div v-else-if="isFillBlankQuestion(question.type)" class="answer-display">
                        <div class="answer-label">您的答案：</div>
                        <div v-if="question.studentAnswer && question.studentAnswer.length > 0" class="answer-content">
                            <span
                                v-for="(answer, ansIndex) in question.studentAnswer"
                                :key="ansIndex"
                                class="blank-answer-item">
                                <span>{{ ansIndex + 1 }}、</span>
                                <span
                                    v-html="answer.answerContent || '无答案'"
                                    :class="{
                                        correct: isFillBlankAnswerCorrect(answer, question.questionAnswer, ansIndex),
                                        incorrect: !isFillBlankAnswerCorrect(answer, question.questionAnswer, ansIndex),
                                    }"></span>
                                <span v-if="ansIndex < question.studentAnswer.length - 1">；&nbsp;</span>
                            </span>
                        </div>
                        <div v-else class="no-answer">未作答</div>
                    </div>

                    <!-- 简答/写作答案 -->
                    <div v-else-if="isWrittenType(question.type)" class="answer-display">
                        <div class="answer-label">您的答案：</div>
                        <div v-if="question.studentAnswer && question.studentAnswer.length > 0" class="answer-content">
                            <p
                                v-for="(answer, ansIndex) in question.studentAnswer"
                                :key="ansIndex"
                                v-html="answer.answerContent || '无答案'"></p>
                        </div>
                        <div v-else class="no-answer">未作答</div>
                    </div>

                    <!-- 口语答案 -->
                    <div v-else-if="isSpeakingType(question.type)" class="answer-display">
                        <div class="answer-label">您的录音：</div>
                        <div
                            v-if="
                                question.studentAnswer &&
                                question.studentAnswer.length > 0 &&
                                question.studentAnswer[0].answerContent
                            "
                            class="audio-player">
                            <audio controls :src="question.studentAnswer[0].answerContent">
                                您的浏览器不支持音频播放
                            </audio>
                        </div>
                        <div v-else class="no-answer">未上传录音</div>
                    </div>

                    <!-- 选择题和填空题的答案解析 -->
                    <div
                        v-if="
                            (isChoiceType(question.type) || isFillBlankQuestion(question.type)) &&
                            question.questionAnswer
                        "
                        class="question-analysis">
                        <div class="analysis-item">
                            <div class="analysis-label">正确答案：</div>
                            <div class="analysis-content">
                                <template v-if="isChoiceType(question.type)">
                                    {{ getCorrectChoiceAnswers(question.questionAnswer).join("、") }}
                                </template>
                                <template v-else-if="isFillBlankQuestion(question.type)">
                                    <template v-for="(answer, index) in question.questionAnswer" :key="index">
                                        <span v-if="index > 0">&nbsp;&nbsp;</span>
                                        {{ index + 1 }}、{{ answer.answerContent }}
                                    </template>
                                </template>
                            </div>
                        </div>
                        <div class="analysis-item">
                            <div class="analysis-label">试题解析：</div>
                            <div class="analysis-content" v-html="question.explan || '无'"></div>
                        </div>
                    </div>

                    <!-- 简答题及以上的批改评语和答案解析 -->
                    <div v-if="question.type >= 5" class="question-analysis">
                        <div class="analysis-item">
                            <div class="analysis-label">批改评语：</div>
                            <div class="analysis-content">
                                <template
                                    v-if="question.studentAnswer && question.studentAnswer.some(a => a.reviewContent)">
                                    <template v-for="(answer, index) in question.studentAnswer" :key="index">
                                        <p v-if="answer.reviewContent" v-html="answer.reviewContent"></p>
                                    </template>
                                </template>
                                <template v-else>待批改</template>
                            </div>
                        </div>
                        <div class="analysis-item">
                            <div class="analysis-label">答案解析：</div>
                            <div class="analysis-content" v-html="question.explan || '无'"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import { formatDurationTime } from "@/utils/tools";
import { ExamItem, QuestionItem, MetaItem, StudentAnswerItem, QuestionAnswerItem } from "@/types/exam";
import { Clock, Document } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 定义接口
interface ExamResult extends ExamItem {
    questions: QuestionItem[];
    metas: MetaItem[];
    studentScore?: number;
    studentSpendTime?: number;
    currentLevel?: string;
}

// 响应式数据
const loading = ref(false);
const examResult = ref<ExamResult | null>(null);

// 计算属性 - 按原始顺序返回的题目
const orderedQuestions = computed(() => {
    return examResult.value?.questions || [];
});

const isChoiceType = (type: number) => {
    return [1, 2, 3].includes(type); // 单选、多选、判断
};

const isWrittenType = (type: number) => {
    return [4, 5, 6].includes(type); // 填空、简答、写作
};

const isSpeakingType = (type: number) => {
    return type === 7; // 口语
};

const isFillBlankQuestion = (type: number) => {
    return type === 4; // 填空题
};

// 方法
const handleBack = () => {
    router.push("/profile");
};

// 获取题型文本
const getQuestionType = (type: number) => {
    const typeMap: Record<number, string> = {
        1: "单选题",
        2: "多选题",
        3: "判断题",
        4: "填空题",
        5: "简答题",
        6: "写作题",
        7: "口语题",
    };
    return typeMap[type] || "未知题型";
};

// 判断选项是否被选中
const isSelected = (answerId: number, studentAnswers: StudentAnswerItem[]) => {
    if (!studentAnswers || studentAnswers.length === 0) return false;
    return studentAnswers.some((answer: StudentAnswerItem) => answer.answerId === answerId);
};

// 判断是否是正确答案
const isCorrectAnswer = (answerId: number, questionAnswers: QuestionAnswerItem[]) => {
    if (!questionAnswers || questionAnswers.length === 0) return false;
    return questionAnswers.some((answer: QuestionAnswerItem) => answer.answerId === answerId && answer.isCorrect == 1);
};

// 获取正确的选项答案（A、B、C等）
const getCorrectChoiceAnswers = (questionAnswers: QuestionAnswerItem[]) => {
    if (!questionAnswers || questionAnswers.length === 0) return [];
    return questionAnswers
        .filter((answer: QuestionAnswerItem) => answer.isCorrect === 1)
        .map((answer: QuestionAnswerItem) => String.fromCharCode(65 + answer.index));
};

// 判断填空题答案是否完全正确
const isFillBlankCorrect = (question: QuestionItem) => {
    if (
        !question.questionAnswer ||
        !question.studentAnswer ||
        question.questionAnswer.length !== question.studentAnswer.length
    ) {
        return false;
    }
    return question.questionAnswer.every((correctAnswer: QuestionAnswerItem, index: number) => {
        const studentAnswer = question.studentAnswer[index];
        return studentAnswer && studentAnswer.answerContent === correctAnswer.answerContent;
    });
};

// 判断单个填空答案是否正确
const isFillBlankAnswerCorrect = (
    studentAnswer: StudentAnswerItem,
    questionAnswers: QuestionAnswerItem[],
    index: number
) => {
    if (!studentAnswer || !questionAnswers || index >= questionAnswers.length) {
        return false;
    }
    const correctAnswer = questionAnswers[index];
    return correctAnswer && studentAnswer.answerContent === correctAnswer.answerContent;
};

// 根据metaId获取材料
const getMetaById = (metaId: number) => {
    if (!metaId || !examResult.value) return null;
    return examResult.value.metas.find(m => m.id === metaId) || null;
};

// 判断是否应该显示材料（仅在该材料的第一个题目显示）
const showMaterial = (index: number, question: QuestionItem) => {
    if (!question.metaId || !examResult.value) return false;

    // 查找该metaId在题目列表中第一次出现的位置
    const firstOccurrence = examResult.value.questions.findIndex(q => q.metaId === question.metaId);

    // 只有在第一次出现时才显示材料
    return index === firstOccurrence;
};

// 获取材料的索引（显示为"材料X"）
const getMaterialIndex = (metaId: number) => {
    if (!metaId || !examResult.value) return "";

    // 收集所有唯一的metaId
    const uniqueMetaIds = [...new Set(examResult.value.questions.filter(q => q.metaId).map(q => q.metaId))];

    // 找到当前metaId在唯一列表中的位置
    const index = uniqueMetaIds.indexOf(metaId);

    return index !== -1 ? index + 1 : "";
};

// 获取考试详情
const fetchExamDetail = async () => {
    const examId = route.query.examId;
    if (!examId) {
        ElMessage.error("考试ID缺失");
        router.push("/404");
        return;
    }

    loading.value = true;
    try {
        const result = await authStore.fetchAuthReq("/mapi/napi/exam_detail", "POST", {
            exam_id: examId,
        });

        if (!result || result.status !== 0) {
            throw new Error(result?.msg || "获取考试详情失败");
        }

        const { apiExam, questions, metas, spendTime, studentScore, currentLevel } = result.data;

        // 从localStorage获取考试信息
        const storedExam = localStorage.getItem("examResult");
        let examInfo = storedExam ? JSON.parse(storedExam) : {};

        // 如果localStorage中没有，从result.data中获取
        if (!examInfo.paperName && result.data) {
            examInfo = {
                ...apiExam,
                ...examInfo,
            };
        }

        // 构建完整的考试结果
        examResult.value = {
            ...examInfo,
            questions: questions || [],
            metas: metas || [],
            studentScore: studentScore || 0,
            studentSpendTime: spendTime || 0,
            questionTotal: questions?.length || 0,
            currentLevel: currentLevel || "",
        };
    } catch (error: any) {
        console.error("获取考试详情失败:", error);
        // 跳转到404页面
        router.push("/404");
    } finally {
        loading.value = false;
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchExamDetail();
});
</script>

<style scoped lang="scss">
.detail-view {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    position: relative;
}

.top-nav {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 60px;
    position: relative;
    z-index: 100;

    .logo {
        height: 40px;
    }

    .nav-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
    }

    .nav-right {
        padding-right: 24px;
    }
}

.main-content {
    flex: 1;
    padding: 24px;
    position: relative;
}

.score-circle {
    position: absolute;
    top: 40px;
    right: 60px;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409eff, #36cfc9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    z-index: 10;

    .score-value {
        font-size: 36px;
        font-weight: bold;
    }

    .score-label {
        font-size: 14px;
        opacity: 0.9;
    }
}

.exam-info {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;

    h2 {
        margin: 0 0 16px 0;
        color: #303133;
        font-size: 24px;
    }

    .exam-meta {
        display: flex;
        gap: 24px;

        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #606266;

            .el-icon {
                font-size: 16px;
            }
        }
    }
}

.questions-container {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.meta-content {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .meta-header {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #409eff;
        font-weight: 600;
        margin-bottom: 12px;
        font-size: 16px;
    }

    .meta-text {
        color: #303133;
        line-height: 1.6;
    }

    .audio-player {
        margin-top: 12px;
    }
}

.question-item {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    .question-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .question-number {
            font-weight: bold;
            color: #303133;
            min-width: 30px;
        }

        .question-type {
            color: #409eff;
            font-size: 14px;
        }

        .question-score {
            color: #67c23a;
            font-size: 14px;
            font-weight: 500;
        }
    }

    .question-content {
        color: #303133;
        line-height: 1.6;
        margin-bottom: 16px;
    }

    .question-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .option-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        border-radius: 6px;
        background: #f8f9fa;
        transition: all 0.3s;

        &.selected1 {
            background: #e8f4fd;
            border: 1px solid #409eff;
        }

        &.selected {
            background: #f0f9eb;
            border: 1px solid #67c23a;
        }

        &.incorrect {
            background: #fef0f0;
            border: 1px solid #f56c6c;
        }

        .option-letter {
            min-width: 20px;
            font-weight: bold;
            color: #409eff;
        }

        .option-content {
            flex: 1;
            color: #303133;
            line-height: 1.6;
        }
    }

    .answer-display {
        margin-top: 16px;

        .answer-label {
            font-weight: 600;
            color: #303133;
            margin-bottom: 8px;
        }

        .answer-content {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            color: #303133;
            line-height: 1.6;

            &.correct {
                background: #f0f9eb;
                border: 1px solid #67c23a;
            }

            &.incorrect {
                background: #fef0f0;
                border: 1px solid #f56c6c;
            }

            .blank-answer-item {
                font-weight: 500;
            }

            .blank-answer-item .correct {
                color: #67c23a;
                background: #f0f9eb;
                padding: 2px 6px;
                border-radius: 4px;
                border: 1px solid #67c23a;
                margin: 0 2px;
            }

            .blank-answer-item .incorrect {
                color: #f56c6c;
                background: #fef0f0;
                padding: 2px 6px;
                border-radius: 4px;
                border: 1px solid #f56c6c;
                margin: 0 2px;
            }

            p {
                margin: 0 0 8px 0;

                &:last-child {
                    margin-bottom: 0;
                }

                &.correct {
                    color: #67c23a;
                    font-weight: 500;
                }

                &.incorrect {
                    color: #f56c6c;
                }
            }
        }

        .no-answer {
            color: #909399;
            font-style: italic;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 6px;
        }

        .audio-player {
            margin-top: 8px;
        }
    }

    .question-analysis {
        margin-top: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .analysis-item {
        margin-bottom: 12px;

        &:last-child {
            margin-bottom: 0;
        }

        .analysis-label {
            font-weight: 600;
            color: #303133;
            margin-bottom: 6px;
            display: block;
        }

        .analysis-content {
            color: #030e24;
            line-height: 1.6;
            font-size: 13px;
            font-weight: 600;
            word-break: break-word;

            p {
                margin: 0 0 8px 0;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}

// 移动端适配
@media (max-width: 768px) {
    .main-content {
        padding: 16px;
    }

    .score-circle {
        width: 80px;
        height: 80px;
        top: 20px;
        right: 20px;

        .score-value {
            font-size: 28px;
        }

        .score-label {
            font-size: 12px;
        }
    }

    .exam-info {
        padding: 20px;

        h2 {
            font-size: 20px;
        }

        .exam-meta {
            flex-direction: column;
            gap: 12px;
        }
    }

    .questions-container {
        padding: 20px;
    }

    .meta-content {
        padding: 16px;
    }

    .question-item {
        margin-bottom: 20px;
        padding-bottom: 20px;
    }
}

@media (max-width: 480px) {
    .top-nav {
        padding: 0 16px;

        .logo {
            height: 32px;
        }

        .nav-title {
            font-size: 16px;
        }

        .nav-right {
            padding-right: 0;
        }
    }

    .main-content {
        padding: 12px;
    }

    .score-circle {
        width: 70px;
        height: 70px;
        top: 15px;
        right: 15px;

        .score-value {
            font-size: 24px;
        }
    }

    .exam-info {
        padding: 16px;

        h2 {
            font-size: 18px;
        }
    }

    .questions-container {
        padding: 16px;
    }

    .meta-content {
        padding: 12px;
    }

    .question-item {
        margin-bottom: 16px;
        padding-bottom: 16px;
    }
}
</style>
