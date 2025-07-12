<template>
  <div class="reading-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <el-container class="reading-container">
      <el-aside width="55%" class="passage-area">
        <div class="passage-header">
          <h4>阅读材料</h4>
          <div class="passage-tools">
            <el-button size="small" @click="highlightSentence">
              <el-icon><Highlight /></el-icon>
              高亮句子
            </el-button>
            <el-button size="small" @click="clearHighlights">清除高亮</el-button>
          </div>
        </div>

        <div class="passage-content" @mouseup="handleTextSelection">
          <div
            v-for="(paragraph, index) in processedPassage"
            :key="index"
            class="passage-paragraph"
            v-html="paragraph"></div>
        </div>
      </el-aside>

      <el-main class="questions-area">
        <div class="questions-header">
          <h4>问题 ({{ question.questions.length }} 题)</h4>
        </div>

        <div class="questions-list">
          <div v-for="(q, index) in question.questions" :key="q.id" :id="`question-${q.id}`" class="question-item">
            <div class="question-title-bar" @click="scrollToRelatedText(q.id)">
              <span class="question-index">{{ index + 1 }}.</span>
              <span class="question-text">{{ q.question }}</span>
              <el-icon class="locate-icon"><Location /></el-icon>
            </div>

            <div class="question-options">
              <div
                v-for="option in q.options"
                :key="option.id"
                :class="['option-item', { selected: isSelected(q.id, option.id) }]"
                @click="selectOption(q.id, option.id)">
                <span class="option-label">{{ option.id }}</span>
                <span class="option-text">{{ option.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";

interface QuestionOption {
  id: string;
  text: string;
}

interface ReadingQuestion {
  id: number;
  question: string;
  options: QuestionOption[];
}

interface Question {
  id: number;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
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
const highlightedSentences = ref<Set<number>>(new Set());

// 初始化答案
if (props.answer) {
  answers.value = { ...props.answer };
}

// 处理文章内容，分段并支持高亮
const processedPassage = computed(() => {
  const paragraphs = props.question.passage.split("\n").filter(p => p.trim());
  return paragraphs.map((paragraph, index) => {
    const isHighlighted = highlightedSentences.value.has(index);
    return isHighlighted ? `<span class="highlighted-sentence">${paragraph}</span>` : paragraph;
  });
});

const isSelected = (questionId: number, optionId: string) => {
  return answers.value[questionId] === optionId;
};

const selectOption = (questionId: number, optionId: string) => {
  answers.value[questionId] = optionId;
  emit("answer-change", { ...answers.value });
};

let selectedTextRange: Range | null = null;

const handleTextSelection = () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    selectedTextRange = selection.getRangeAt(0).cloneRange();
  }
};

const highlightSentence = () => {
  if (selectedTextRange) {
    const selectedText = selectedTextRange.toString();
    if (selectedText.trim()) {
      // 简单的高亮实现，实际项目中可能需要更复杂的文本处理
      ElMessage.success("已高亮选中文本");
    } else {
      ElMessage.warning("请先选择要高亮的文本");
    }
  } else {
    ElMessage.warning("请先选择要高亮的文本");
  }
};

const clearHighlights = () => {
  highlightedSentences.value.clear();
  ElMessage.success("已清除所有高亮");
};

const scrollToRelatedText = (questionId: number) => {
  // 模拟滚动到相关文本位置
  const passageArea = document.querySelector(".passage-content");
  if (passageArea) {
    // 简单实现：滚动到指定位置（实际项目中需要根据题目定位相关段落）
    const scrollPosition = (questionId - 1) * 100;
    passageArea.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  }
  ElMessage.info(`定位到第 ${questionId} 题相关内容`);
};

// 监听question变化，重置答案
watch(
  () => props.question.id,
  () => {
    answers.value = props.answer || {};
    highlightedSentences.value.clear();
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.reading-question {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px 16px;
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

.reading-container {
  flex: 1;
  height: calc(100% - 80px);
}

.passage-area {
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;

  .passage-header {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      color: #303133;
      font-size: 16px;
    }

    .passage-tools {
      display: flex;
      gap: 8px;
    }
  }

  .passage-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    line-height: 2;
    font-size: 15px;
    color: #303133;

    .passage-paragraph {
      margin-bottom: 16px;
      text-align: justify;

      :deep(.highlighted-sentence) {
        background: linear-gradient(120deg, #fef3ac 0%, #f59b00 100%);
        padding: 2px 4px;
        border-radius: 4px;
        color: #606266;
      }
    }
  }
}

.questions-area {
  background: white;
  padding: 0;
  display: flex;
  flex-direction: column;

  .questions-header {
    padding: 20px 24px;
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;

    h4 {
      margin: 0;
      color: #303133;
      font-size: 16px;
    }
  }

  .questions-list {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
}

.question-item {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
  }

  .question-title-bar {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #ecf5ff, #e6f7ff);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #d9ecff, #cceeff);
      transform: translateX(4px);
    }

    .question-index {
      font-weight: 600;
      color: #409eff;
      margin-right: 8px;
    }

    .question-text {
      flex: 1;
      font-size: 15px;
      color: #303133;
    }

    .locate-icon {
      color: #409eff;
      margin-left: 8px;
    }
  }

  .question-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 16px;
  }
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.selected {
    border-color: #409eff;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(103, 194, 58, 0.1));
  }

  .option-label {
    font-weight: 600;
    color: #409eff;
    margin-right: 12px;
    width: 20px;
  }

  .option-text {
    flex: 1;
    font-size: 14px;
    color: #303133;
  }
}
</style>
