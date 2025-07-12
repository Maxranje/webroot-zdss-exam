<template>
    <div class="stats-cards">
        <el-card class="stat-card gradient-card" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ userStats.totalExams }}</div>
                <div class="stat-label">累计考试</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-2" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><ReadingLamp /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ userStats.studyHours }}h</div>
                <div class="stat-label">累计学习</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-3" shadow="hover">
            <div class="stat-icon">
                <el-icon size="24"><Trophy /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ userStats.currentScore }}</div>
                <div class="stat-label">当前测试分</div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// 用户统计数据
const userStats = ref({
    totalExams: 26,
    studyHours: 156,
    currentScore: 7.5,
});
</script>

<style scoped lang="scss">
.stats-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.stat-card {
    border: none;
    color: white;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    :deep(.el-card__body) {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .stat-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-content {
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
    }
}

.gradient-card {
    background: linear-gradient(135deg, #6374c1 0%, #764ba2 100%);
}

.gradient-card-2 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(245, 87, 108, 0.3);
    }
}

.gradient-card-3 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

    &:hover {
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
    }
}

// 移动端适配
@media (max-width: 768px) {
    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }
    
    .stat-card {
        :deep(.el-card__body) {
            padding: 16px;
            gap: 12px;
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
        }
        
        .stat-content {
            .stat-number {
                font-size: 20px;
            }
            
            .stat-label {
                font-size: 13px;
            }
        }
    }
}

@media (max-width: 480px) {
    .stats-cards {
        grid-template-columns: 1fr;
    }
    
    .stat-card {
        :deep(.el-card__body) {
            padding: 12px;
            gap: 10px;
        }
        
        .stat-icon {
            width: 36px;
            height: 36px;
        }
        
        .stat-content {
            .stat-number {
                font-size: 18px;
            }
            
            .stat-label {
                font-size: 12px;
            }
        }
    }
}
</style> 