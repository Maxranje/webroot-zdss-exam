<template>
  <div class="fill-blank">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="question-content">
      <div class="question-text" v-html="processedContent"></div>
    </div>

    <div class="blanks-container">
      <div class="blank-inputs">
        <div v-for="(blank, index) in question.blanks" :key="blank.id" class="blank-item">
          <label class="blank-label">空格 {{ index + 1 }}：</label>
          <el-input
            v-model="answers[blank.id]"
            :placeholder="blank.placeholder || '请填写答案'"
            size="large"
            clearable
            @input="updateAnswer"
            class="blank-input" />
        </div>
      </div>
    </div>

    <div class="question-info">
      <span class="fill-tip">
        <el-icon><InfoFilled /></el-icon>
        请在上方输入框中填写对应的答案，答案将自动填入题目中的空白处
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Blank {
  id: number;
  placeholder?: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  blanks: Blank[];
}

interface Props {
  question: Question;
  answer?: Record<number, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: Record<number, string>];
}>();

const answers = ref<Record<number, string>>({});

// 初始化答案
if (props.answer) {
  answers.value = { ...props.answer };
} else {
  // 为每个空格初始化空字符串
  props.question.blanks.forEach(blank => {
    answers.value[blank.id] = "";
  });
}

// 处理题目内容，将 _____ 替换为带编号的空白标记
const processedContent = computed(() => {
  let content = props.question.content;
  let blankIndex = 0;

  // 替换连续的下划线为带编号的空白标记
  content = content.replace(/_{3,}/g, () => {
    blankIndex++;
    const answer = answers.value[blankIndex] || "";
    return `<span class="blank-placeholder" data-index="${blankIndex}">
      <span class="blank-number">${blankIndex}</span>
      <span class="blank-content">${answer || "______"}</span>
    </span>`;
  });

  return content;
});

const updateAnswer = () => {
  emit("answer-change", { ...answers.value });
};

// 监听question变化，重置答案
watch(
  () => props.question.id,
  () => {
    answers.value = {};
    if (props.answer) {
      answers.value = { ...props.answer };
    } else {
      props.question.blanks.forEach(blank => {
        answers.value[blank.id] = "";
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.fill-blank {
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
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
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
      border-radius: 8px;
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

  .blank-input {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      border: 2px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover {
        border-color: #409eff;
      }

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }
}

.question-info {
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;

  .fill-tip {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      color: #409eff;
    }
  }
}
</style>
