<template>
    <div class="stats-cards">
        <el-card class="stat-card gradient-card" shadow="hover" v-loading="loadingStats" :body-style="{ padding: '0' }">
            <div class="stat-icon">
                <el-icon size="24"><DocumentChecked /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ userStats.totalExams }}</div>
                <div class="stat-label">累计模考</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-2" shadow="hover" v-loading="loadingStats" :body-style="{ padding: '0' }">
            <div class="stat-icon">
                <el-icon size="24"><ReadingLamp /></el-icon>
            </div>
            <div class="stat-content">
                <div class="stat-number">{{ userStats.studyHours }}h</div>
                <div class="stat-label">单词本</div>
            </div>
        </el-card>

        <el-card class="stat-card gradient-card-3" shadow="hover" v-loading="loadingStats" :body-style="{ padding: '0' }">
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

let loadingStats = ref(false);
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

    &:hover {
        transform: translateY(-2px);
    }

    :deep(.el-card__body) {
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
            font-weight: bold;
            margin-bottom: 2px;
        }

        .stat-label {
            font-weight: bold;
            opacity: 0.9;
        }
    }
}

.gradient-card {
    background-image: url("/img/card_bg1.png");
    background-size: cover;
    background-position: center;
    border-radius: 1rem;
    color: #667eea;
    padding: 0.85rem 2rem;
    &:hover {
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .stat-icon {
        background: rgba(102, 126, 234, 0.2);
    }
}

.gradient-card-2 {
    background-image: url("/img/card_bg2.png");
    background-size: cover;
    background-position: center;
    border-radius: 1rem;
    color: #2d88c8;
    padding: 0.85rem 2rem;
    &:hover {
        box-shadow: 0 8px 25px rgba(32, 57, 79, 0.29);
    }

    .stat-icon {
        background: rgba(90, 116, 181, 0.2);
    }
}

.gradient-card-3 {
    background-image: url("/img/card_bg3.png");
    background-size: cover;
    background-position: center;
    border-radius: 1rem;
    color: #4facee;
    padding: 0.85rem 2rem;
    &:hover {
        box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
    }

    .stat-icon {
        background: rgba(79, 172, 254, 0.2);
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