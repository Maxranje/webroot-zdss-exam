<template>
  <div class="choice-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="question-content">
      <p class="question-text">{{ question.content }}</p>
    </div>

    <div class="options-container">
      <div
        v-for="option in question.options"
        :key="option.id"
        :class="[
          'option-card',
          {
            selected: isSelected(option.id),
            multiple: question.multiple,
          },
        ]"
        @click="selectOption(option.id)">
        <div class="option-indicator">
          <div v-if="question.multiple" class="checkbox">
            <el-icon v-if="isSelected(option.id)"><Check /></el-icon>
          </div>
          <div v-else class="radio">
            <div v-if="isSelected(option.id)" class="radio-dot"></div>
          </div>
        </div>
        <div class="option-content">
          <span class="option-label">{{ option.id }}.</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </div>
    </div>

    <div class="question-info">
      <span class="selection-type">
        {{ question.multiple ? "多选题（可选择多个答案）" : "单选题（请选择一个答案）" }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  title: string;
  content: string;
  options: Option[];
  multiple: boolean;
}

interface Props {
  question: Question;
  answer?: string | string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: string | string[]];
}>();

const selectedAnswers = ref<string[]>([]);

// 初始化答案
if (props.answer) {
  if (Array.isArray(props.answer)) {
    selectedAnswers.value = [...props.answer];
  } else {
    selectedAnswers.value = [props.answer];
  }
}

const isSelected = (optionId: string) => {
  return selectedAnswers.value.includes(optionId);
};

const selectOption = (optionId: string) => {
  if (props.question.multiple) {
    // 多选逻辑
    const index = selectedAnswers.value.indexOf(optionId);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1);
    } else {
      selectedAnswers.value.push(optionId);
    }
    emit("answer-change", [...selectedAnswers.value]);
  } else {
    // 单选逻辑
    selectedAnswers.value = [optionId];
    emit("answer-change", optionId);
  }
};

// 监听question变化，重置答案
watch(
  () => props.question.id,
  () => {
    selectedAnswers.value = [];
    if (props.answer) {
      if (Array.isArray(props.answer)) {
        selectedAnswers.value = [...props.answer];
      } else {
        selectedAnswers.value = [props.answer];
      }
    }
  }
);
</script>

<style scoped lang="scss">
.choice-question {
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

  .question-text {
    font-size: 16px;
    line-height: 1.8;
    color: #606266;
    margin: 0;
  }
}

.options-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.option-card {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #409eff;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.3);
  }
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
    background: #409eff;
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
    color: #409eff;
    margin-right: 12px;
    font-size: 16px;
  }

  .option-text {
    font-size: 15px;
    color: #303133;
    line-height: 1.6;
  }
}

.question-info {
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;

  .selection-type {
    font-size: 13px;
    color: #909399;
    font-style: italic;
  }
}
</style>
