<template>
    <div class="choice-question">
        <div class="question-content" v-html="question.content"></div>
        <div class="question-answer-container">
            <div
                v-for="option in getOptions()"
                :key="option.answerId"
                :class="[
                    'option-card',
                    {
                        selected: isSelected(option.answerId.toString()),
                        multiple: isMultipleChoice,
                    },
                ]"
                @click="selectOption(option.answerId.toString())">
                <div class="option-indicator">
                    <div v-if="isMultipleChoice" class="checkbox">
                        <el-icon v-if="isSelected(option.answerId.toString())"><Check /></el-icon>
                    </div>
                    <div v-else class="radio">
                        <div v-if="isSelected(option.answerId.toString())" class="radio-dot"></div>
                    </div>
                </div>
                <div class="option-content">
                    <span class="option-label">{{ getOptionLabel(option.answerId) }}.</span>
                    <span class="option-text">{{ option.answerContent }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { QuestionItem, QuestionAnswerItem, StudentAnswerItem } from "@/types/exam";

const props = defineProps<{
    question: QuestionItem;
    studentAnswer?: StudentAnswerItem[];
}>();
const emit = defineEmits<{
    "answer-change": [answer: StudentAnswerItem[]];
}>();

// 判断是否为多选题（根据type值判断：1=单选题，2=多选题，3=其他类型但可能需要特殊处理）
const isMultipleChoice = computed(() => {
    return props.question.type === 2;
});

// 初始化选中的答案
const selectedAnswers = ref<string[]>([]);

// 初始化答案
const initializeAnswers = () => {
    selectedAnswers.value = [];
    if (props.studentAnswer && props.studentAnswer.length > 0) {
        selectedAnswers.value = props.studentAnswer.map(answer => answer.answerId.toString());
    }
};

// 根据题目类型获取对应的选项
const getOptions = (): QuestionAnswerItem[] => {
    // 确保question和questionAnswer存在
    if (!props.question || !props.question.questionAnswer) {
        return [];
    }

    // 根据question.type过滤选项
    // 1=单选题，2=多选题，3=可能是其他类型但也显示选项
    return props.question.questionAnswer.filter(option => {
        if (option?.type === 1 || option?.type === 2 || option?.type === 3) {
            return true;
        }
        return false;
    });
};

// 获取选项标签（A、B、C、D等）
const getOptionLabel = (answerId: number): string => {
    const options = getOptions();
    const index = options.findIndex(opt => opt.answerId === answerId);
    return index >= 0 ? String.fromCharCode(65 + index) : ""; // 65是ASCII码中'A'的值
};

// 检查选项是否被选中
const isSelected = (optionId: string): boolean => {
    return selectedAnswers.value.includes(optionId);
};

// 选择选项
const selectOption = (optionId: string): void => {
    if (isMultipleChoice.value) {
        // 多选逻辑
        const index = selectedAnswers.value.indexOf(optionId);
        if (index > -1) {
            selectedAnswers.value.splice(index, 1);
        } else {
            selectedAnswers.value.push(optionId);
        }
    } else {
        // 单选逻辑
        selectedAnswers.value = [optionId];
    }

    // 将选中的answerId转换为StudentAnswerItem[]
    const options = getOptions();
    const studentAnswers: StudentAnswerItem[] = selectedAnswers.value.map(answerIdStr => {
        const answerId = parseInt(answerIdStr);
        const option = options.find(opt => opt.answerId === answerId);
        return {
            id: 0, // 这里id通常由后端生成，前端可以设为0
            qid: props.question.qid,
            answerId: answerId,
            answerContent: option?.answerContent || "",
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

// 监听studentAnswer变化，更新答案
watch(
    () => props.studentAnswer,
    () => {
        initializeAnswers();
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.choice-question {
    padding: 2rem 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.question-content {
    font-size: 16px;
    line-height: 1.8;
    color: #242527;
    background: #f8f9fa;
    padding: 24px;
    border-left: 4px solid #409eff;
    margin: 0;
}

.question-answer-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.option-card {
    display: flex;
    align-items: center;
    padding: 16px 0px;
    background: white;
    cursor: pointer;
    user-select: none;
}

.option-indicator {
    margin-right: 16px;
    flex-shrink: 0;

    .checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid #dcdfe6;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        transition: all 0.3s ease;

        .el-icon {
            color: #409eff;
            font-size: 14px;
        }
    }

    .radio {
        width: 20px;
        height: 20px;
        border: 2px solid #dcdfe6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        transition: all 0.3s ease;

        .radio-dot {
            width: 10px;
            height: 10px;
            background: #409eff;
            border-radius: 50%;
        }
    }
}

.selected {
    .checkbox {
        border-color: #409eff;
    }

    .radio {
        border-color: #409eff;
    }
}

.option-content {
    display: flex;
    align-items: center;
    flex: 1;

    .option-label {
        font-weight: 600;
        margin-right: 12px;
        font-size: 16px;
    }

    .option-text {
        font-size: 16px;
        color: #242527;
        line-height: 1.6;
    }
}
</style>
