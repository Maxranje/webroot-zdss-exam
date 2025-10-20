<template>
    <div class="fill-blank">
        <div class="question-content">
            <div class="question-text" v-html="processedContent"></div>
        </div>

        <div class="blanks-container">
            <div class="blank-inputs">
                <div v-for="(option, index) in question.questionAnswer" :key="option.answerId" class="blank-item">
                    <label class="blank-label">空格 {{ index + 1 }}：</label>
                    <el-input
                        v-model="blankAnswers[index]"
                        :placeholder="'请填写答案'"
                        size="large"
                        clearable
                        @input="updateAnswer"
                        class="blank-input" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { QuestionItem, StudentAnswerItem } from "@/types/exam";

const props = defineProps<{
    question: QuestionItem;
    studentAnswer?: StudentAnswerItem[];
}>();
const emit = defineEmits<{
    "answer-change": [answer: StudentAnswerItem[]];
}>();

// 初始化答案数组
const blankAnswers = ref<string[]>([]);

// 初始化答案
const initializeAnswers = () => {
    blankAnswers.value = [];
    if (props.studentAnswer && props.studentAnswer.length > 0) {
        // 如果有已有答案，填充到答案数组中
        props.studentAnswer.forEach((ans, index) => {
            blankAnswers.value[index] = ans.answerContent || "";
        });
    } else if (props.question.questionAnswer) {
        // 如果没有已有答案，但有问题选项，初始化空字符串数组
        props.question.questionAnswer.forEach(() => {
            blankAnswers.value.push("");
        });
    }
};

// 处理题目内容，将 _____ 替换为带编号的空白标记
const processedContent = computed(() => {
    if (!props.question || !props.question.content) {
        return "";
    }

    let content = props.question.content;
    let blankIndex = 0;

    // 替换连续的下划线为带编号的空白标记
    content = content.replace(/_{3,}/g, () => {
        const answer = blankAnswers.value[blankIndex] || "";
        const result = `<span class="blank-placeholder" data-index="${blankIndex}">
      <span class="blank-number">${blankIndex + 1}</span>
      <span class="blank-content">${answer || "______"}</span>
    </span>`;
        blankIndex++;
        return result;
    });

    return content;
});

const updateAnswer = () => {
    // 将答案数组转换为StudentAnswerItem数组格式
    const studentAnswers: StudentAnswerItem[] = blankAnswers.value.map((answer, index) => {
        return {
            id: 0, // 临时ID，实际提交时可能会被后端覆盖
            qid: props.question.qid,
            answerId: props.question.questionAnswer ? props.question.questionAnswer[index]?.answerId || 0 : 0,
            answerContent: answer,
            reviewContent: "",
            score: 0,
        };
    });

    emit("answer-change", studentAnswers);
};

// 初始化答案
initializeAnswers();

// 监听question变化，重置答案
watch(
    () => props.question.qid,
    () => {
        initializeAnswers();
    }
);

// 监听answer变化，更新答案
watch(
    () => props.studentAnswer,
    () => {
        initializeAnswers();
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.fill-blank {
    padding: 2rem 0;
    height: 100%;
    display: flex;
    gap: 24px;
    flex-direction: column;
}

.question-content {
    margin-bottom: 32px;
    background: #f8f9fa;
    padding: 24px;
    border-left: 4px solid #409eff;

    .question-text {
        font-size: 16px;
        line-height: 2;
        color: #303133;
        margin: 0;

        :deep(.blank-placeholder) {
            display: inline-block;
            position: relative;
            margin: 0 4px;
            padding: 4px 12px;
            background: linear-gradient(135deg, #ecf5ff, #e6f7ff);
            border: 2px dashed #409eff;
            border-radius: 10px;
            min-width: 80px;
            text-align: center;
            transition: all 0.3s ease;

            .blank-number {
                position: absolute;
                top: -12px;
                left: -8px;
                background: #409eff;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }

            .blank-content {
                font-weight: 500;
                color: #409eff;
                min-height: 20px;
                display: inline-block;
            }

            &:hover {
                background: linear-gradient(135deg, #d9ecff, #cceeff);
                transform: translateY(-1px);
            }
        }
    }
}

.blanks-container {
    flex: 1;
    margin-bottom: 24px;
}

.blank-inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.blank-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .blank-label {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
    }
}
</style>
