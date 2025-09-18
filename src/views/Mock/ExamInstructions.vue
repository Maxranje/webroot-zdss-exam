<template>
    <div class="exam-instructions">
        <div class="instructions-card">
            <h1>考试须知</h1>
            <div class="content">
                <h3>重要提示：</h3>
                <ul>
                    <li>考试过程中请勿刷新或关闭页面，否则可能导致考试数据丢失</li>
                    <li>请确保您的网络连接稳定</li>
                    <li>考试开始后将无法返回，请确保已做好充分准备</li>
                    <li>请提前准备好耳机等必要设备（如有听力和口语考试）</li>
                    <li>考试时间开始后将无法暂停，请合理安排答题时间</li>
                </ul>
                
                <h3>考试时间：</h3>
                <p>本次考试时间为2小时，请合理分配时间</p>
                
                <h3>注意事项：</h3>
                <ul>
                    <li>请独立完成考试，不得查阅任何参考资料</li>
                    <li>系统会自动记录您的作答过程</li>
                    <li>考试结束前请确保所有题目都已完成</li>
                </ul>
            </div>
            
            <div class="actions">
                <el-checkbox v-model="agreed">我已阅读并同意以上考试须知</el-checkbox>
                <el-button 
                    type="primary" 
                    size="large" 
                    :disabled="!agreed" 
                    @click="handleStartExam"
                    :loading="loading">
                    开始考试
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const agreed = ref(false)
const loading = ref(false)

const emit = defineEmits(['start-exam']);

const handleStartExam = async () => {
    if (!agreed.value) {
        ElMessage.warning('请先阅读并同意考试须知')
        return
    }

    loading.value = true;
    try {
        const currentExam = JSON.parse(localStorage.getItem('currentExam') || '{}');
        const response = await fetch('/mapi/napi/exam_start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ examId: currentExam.examId })
        });

        if (!response.ok) {
            throw new Error('开始考试失败');
        }

        const data = await response.json();
        if (data.success) {
            emit('start-exam');
        } else {
            throw new Error(data.message || '开始考试失败');
        }
    } catch (error: any) {
        ElMessage.error(error?.message || '开始考试失败，请重试');
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped lang="scss">
.exam-instructions {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fa;
    padding: 24px;
}

.instructions-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 32px;
    max-width: 800px;
    width: 100%;

    h1 {
        text-align: center;
        color: #333;
        margin-bottom: 32px;
        font-weight: 600;
    }

    .content {
        margin-bottom: 32px;

        h3 {
            color: #333;
            margin: 24px 0 16px;
            font-weight: 600;
        }

        ul {
            padding-left: 20px;
            
            li {
                margin-bottom: 12px;
                color: #666;
                line-height: 1.6;
            }
        }

        p {
            color: #666;
            line-height: 1.6;
        }
    }

    .actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #eee;
    }
}
</style>
