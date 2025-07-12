<template>
  <div class="matching-question">
    <div class="question-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="question-number">第 {{ question.id }} 题</div>
    </div>

    <div class="matching-container">
      <div class="matching-area">
        <!-- 左侧选项 -->
        <div class="left-column">
          <h4 class="column-title">左侧选项</h4>
          <div class="items-list">
            <div
              v-for="item in question.leftItems"
              :key="item.id"
              :class="[
                'matching-item',
                'left-item',
                {
                  selected: selectedLeft?.id === item.id,
                  connected: isLeftConnected(item.id),
                },
              ]"
              @click="selectLeftItem(item)">
              <div class="item-index">{{ item.id }}</div>
              <div class="item-text">{{ item.text }}</div>
              <div class="connection-point left-point"></div>
            </div>
          </div>
        </div>

        <!-- 中间连线区 -->
        <div class="connection-area">
          <div class="connection-lines">
            <div v-for="(connection, index) in matchingAnswers" :key="index" class="connection-line"></div>
          </div>
        </div>

        <!-- 右侧选项 -->
        <div class="right-column">
          <h4 class="column-title">右侧选项</h4>
          <div class="items-list">
            <div
              v-for="item in question.rightItems"
              :key="item.id"
              :class="[
                'matching-item',
                'right-item',
                {
                  selected: selectedRight?.id === item.id,
                  connected: isRightConnected(item.id),
                },
              ]"
              @click="selectRightItem(item)">
              <div class="connection-point right-point"></div>
              <div class="item-index">{{ item.id }}</div>
              <div class="item-text">{{ item.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 连接列表 -->
      <div class="connections-list">
        <h4>已建立的连接</h4>
        <div class="connection-items">
          <div v-for="(connection, index) in matchingAnswers" :key="index" class="connection-item">
            <span class="left-text">{{ getLeftText(connection.left) }}</span>
            <el-icon class="connection-arrow"><Right /></el-icon>
            <span class="right-text">{{ getRightText(connection.right) }}</span>
            <el-button size="small" type="danger" text @click="removeConnection(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div v-if="matchingAnswers.length === 0" class="no-connections">
            <el-icon><Connection /></el-icon>
            <span>暂无连接，请点击左右两侧的选项进行连线</span>
          </div>
        </div>
      </div>
    </div>

    <div class="question-info">
      <span class="matching-tip">
        <el-icon><InfoFilled /></el-icon>
        请点击左侧选项，再点击右侧选项来建立连接
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

interface MatchingItem {
  id: number | string;
  text: string;
}

interface Question {
  id: number;
  title: string;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
}

interface Props {
  question: Question;
  answer?: Array<{ left: number | string; right: number | string }>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "answer-change": [answer: Array<{ left: number | string; right: number | string }>];
}>();

const matchingAnswers = ref<Array<{ left: number | string; right: number | string }>>([]);
const selectedLeft = ref<MatchingItem | null>(null);
const selectedRight = ref<MatchingItem | null>(null);

// 初始化答案
if (props.answer) {
  matchingAnswers.value = [...props.answer];
}

const isLeftConnected = (id: number | string) => {
  return matchingAnswers.value.some(answer => answer.left === id);
};

const isRightConnected = (id: number | string) => {
  return matchingAnswers.value.some(answer => answer.right === id);
};

const selectLeftItem = (item: MatchingItem) => {
  if (selectedLeft.value?.id === item.id) {
    selectedLeft.value = null;
    return;
  }

  selectedLeft.value = item;

  if (selectedRight.value) {
    createConnection();
  }
};

const selectRightItem = (item: MatchingItem) => {
  if (selectedRight.value?.id === item.id) {
    selectedRight.value = null;
    return;
  }

  selectedRight.value = item;

  if (selectedLeft.value) {
    createConnection();
  }
};

const createConnection = () => {
  if (!selectedLeft.value || !selectedRight.value) return;

  // 检查是否已存在连接
  const existingIndex = matchingAnswers.value.findIndex(
    answer => answer.left === selectedLeft.value!.id || answer.right === selectedRight.value!.id
  );

  if (existingIndex > -1) {
    matchingAnswers.value.splice(existingIndex, 1);
  }

  matchingAnswers.value.push({
    left: selectedLeft.value.id,
    right: selectedRight.value.id,
  });

  selectedLeft.value = null;
  selectedRight.value = null;

  emit("answer-change", [...matchingAnswers.value]);
  ElMessage.success("连接已建立");
};

const removeConnection = (index: number) => {
  matchingAnswers.value.splice(index, 1);
  emit("answer-change", [...matchingAnswers.value]);
  ElMessage.success("连接已删除");
};

const getLeftText = (id: number | string) => {
  return props.question.leftItems.find(item => item.id === id)?.text || "";
};

const getRightText = (id: number | string) => {
  return props.question.rightItems.find(item => item.id === id)?.text || "";
};

// 监听question变化，重置答案
watch(
  () => props.question.id,
  () => {
    matchingAnswers.value = props.answer || [];
    selectedLeft.value = null;
    selectedRight.value = null;
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.matching-question {
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

.matching-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.matching-area {
  display: flex;
  align-items: stretch;
  gap: 20px;
  position: relative;
  flex: 1;
  min-height: 400px;
}

.left-column,
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;

  .column-title {
    margin: 0 0 16px 0;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    border-radius: 8px;
    color: #409eff;
    font-size: 16px;
    text-align: center;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.connection-area {
  width: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to right, #f0f9ff, #e0f2fe);
  border-radius: 8px;

  .connection-lines {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

.matching-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    border-color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  &.selected {
    border-color: #e6a23c;
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(255, 193, 7, 0.1));
    box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
  }

  &.connected {
    border-color: #67c23a;
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(64, 158, 255, 0.1));
  }

  .item-index {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    background: #409eff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 12px;
  }

  .item-text {
    flex: 1;
    font-size: 15px;
    color: #303133;
  }

  .connection-point {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #409eff;
    border-radius: 50%;
    border: 2px solid white;

    &.left-point {
      right: -6px;
    }

    &.right-point {
      left: -6px;
    }
  }
}

.right-item {
  .item-index {
    order: 2;
    margin-right: 0;
    margin-left: 12px;
  }
}

.connections-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
  }

  .connection-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .connection-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    .left-text,
    .right-text {
      flex: 1;
      font-size: 14px;
      color: #303133;
    }

    .connection-arrow {
      margin: 0 12px;
      color: #409eff;
    }
  }

  .no-connections {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px;
    color: #909399;
    font-size: 14px;

    .el-icon {
      font-size: 20px;
    }
  }
}

.question-info {
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;

  .matching-tip {
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
