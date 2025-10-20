<template>
    <div class="writing-question">
        <div class="question-header">
            <h3 class="question-title">{{ question.content }}</h3>
        </div>

        <div class="writing-area">
            <el-input
                v-model="writingContent"
                type="textarea"
                :rows="10"
                placeholder="请在此处开始写作..."
                resize="vertical"
                @input="handleInput"
                class="writing-textarea" />

            <div class="writing-toolbar">
                <div class="toolbar-left">
                    <div class="word-count">
                        <span :class="wordCount >= 0 ? 'warning' : ''">字数：{{ wordCount }}</span>
                    </div>
                </div>
                <div class="toolbar-right">
                    <div class="writing-tips">
                        <el-icon><EditPen /></el-icon>
                        <span>请在上方文本框中写作</span>
                    </div>
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

const writingContent = ref("");

// 初始化内容
const initializeContent = () => {
    writingContent.value = "";
    // 从studentAnswer中获取已有答案
    if (props.studentAnswer && props.studentAnswer.length > 0) {
        writingContent.value = props.studentAnswer[0].answerContent || "";
    }
};

// 字数统计
const wordCount = computed(() => {
    // 移除空白字符后计算字数
    return writingContent.value.replace(/\s/g, "").length;
});

// 处理输入变化
const handleInput = () => {
    const studentAnswer: StudentAnswerItem = {
        id: 0,
        answerId: 0,
        qid: props.question.qid,
        answerContent: writingContent.value,
        reviewContent: "",
        score: 0,
    };
    emit("answer-change", [studentAnswer]);
};

// 初始化内容
initializeContent();

// 监听question变化，重置内容
watch(
    () => props.question.qid,
    () => {
        initializeContent();
    }
);

// 监听studentAnswer变化，更新内容
watch(
    () => props.studentAnswer,
    () => {
        initializeContent();
    },
    { deep: true }
);
</script>

<style scoped lang="scss">
.writing-question {
    padding: 2rem 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;

    .question-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
    }
}

.writing-area {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.writing-textarea {
    flex: 1;
    border: none;
    :deep(.el-textarea__inner) {
        border-radius: 8px 8px 0 0;
        border: none;
        font-size: 15px;
        line-height: 1.8;
        resize: none;
        padding: 20px;
    }
}

.writing-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #f8f9fa;
    border: 1px solid #e4e7ed;
    border-top: none;
    border-radius: 0 0 8px 8px;

    .toolbar-left {
        display: flex;
        gap: 8px;
        .word-count {
            font-size: 16px;
            font-weight: 600;
            color: #e6a23c;
        }
    }

    .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
        .writing-tips {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #909399;
        }
    }
}
</style>
