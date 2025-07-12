<template>
  <div class="writing-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="question-content">
      <p class="question-text">{{ question.content }}</p>
    </div>

    <div class="writing-area">
      <div class="writing-header">
        <div class="word-count">
          <span :class="{ warning: wordCount < question.minWords, success: wordCount >= question.minWords }">
            字数：{{ wordCount }}
          </span>
          <span class="word-range">（要求：{{ question.minWords }} - {{ question.maxWords }} 字）</span>
        </div>
        <div class="writing-tips">
          <el-icon><EditPen /></el-icon>
          <span>请在下方文本框中写作</span>
        </div>
      </div>

      <el-input
        v-model="writingContent"
        type="textarea"
        :rows="16"
        placeholder="请在此处开始写作..."
        resize="none"
        @input="updateWordCount"
        class="writing-textarea" />

      <div class="writing-toolbar">
        <div class="toolbar-left">
          <el-button size="small" @click="clearContent" :disabled="!writingContent">清空内容</el-button>
          <el-button size="small" @click="saveToLocal">本地保存</el-button>
        </div>
        <div class="toolbar-right">
          <span class="progress-text">
            进度：{{ Math.min(100, Math.round((wordCount / question.minWords) * 100)) }}%
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${Math.min(100, (wordCount / question.minWords) * 100)}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface Question {
  id: number;
  title: string;
  content: string;
  minWords: number;
  maxWords: number;
}

interface Props {
  question: Question;
  answer?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: string];
}>();

const writingContent = ref("");

// 初始化内容
if (props.answer) {
  writingContent.value = props.answer;
}

// 字数统计
const wordCount = computed(() => {
  // 移除空白字符后计算字数
  return writingContent.value.replace(/\s/g, "").length;
});

const updateWordCount = () => {
  emit("answer-change", writingContent.value);
};

const clearContent = () => {
  ElMessageBox.confirm("确定要清空所有内容吗？此操作不可恢复。", "清空确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      writingContent.value = "";
      updateWordCount();
      ElMessage.success("内容已清空");
    })
    .catch(() => {
      // 用户取消
    });
};

const saveToLocal = () => {
  localStorage.setItem(`writing_${props.question.id}`, writingContent.value);
  ElMessage.success("已保存到本地");
};

// 监听question变化，重置内容
watch(
  () => props.question.id,
  () => {
    writingContent.value = props.answer || "";
    // 尝试从本地恢复
    const localContent = localStorage.getItem(`writing_${props.question.id}`);
    if (localContent && !props.answer) {
      writingContent.value = localContent;
      updateWordCount();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.writing-question {
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
  margin-bottom: 24px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #67c23a;

  .question-text {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
    margin: 0;
  }
}

.writing-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.writing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;

  .word-count {
    display: flex;
    align-items: center;
    gap: 8px;

    > span:first-child {
      font-size: 16px;
      font-weight: 600;

      &.warning {
        color: #e6a23c;
      }

      &.success {
        color: #67c23a;
      }
    }

    .word-range {
      font-size: 13px;
      color: #909399;
    }
  }

  .writing-tips {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #909399;
    font-size: 13px;

    .el-icon {
      color: #409eff;
    }
  }
}

.writing-textarea {
  flex: 1;

  :deep(.el-textarea__inner) {
    border-radius: 0;
    border: 1px solid #e4e7ed;
    border-top: none;
    font-size: 15px;
    line-height: 1.8;
    resize: none;
    padding: 20px;

    &:focus {
      border-color: #409eff;
    }
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
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .progress-text {
      font-size: 13px;
      color: #606266;
    }

    .progress-bar {
      width: 100px;
      height: 6px;
      background: #e4e7ed;
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #e6a23c 0%, #67c23a 70%, #67c23a 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
    }
  }
}
</style>
