<template>
    <div class="error-404">
        <div class="error-container">
            <div class="error-content">
                <div class="error-number">404</div>
                <div class="error-title">页面未找到</div>
                <div class="error-description">抱歉，您访问的页面不存在</div>
                <div class="error-actions">
                    <button class="btn-primary" @click="goHome">
                        <i class="icon-home"></i>
                        返回首页
                    </button>
                </div>
            </div>
            <div class="error-illustration">
                <div class="illustration-container">
                    <div class="search-icon">🔍</div>
                    <div class="question-marks">
                        <span>?</span>
                        <span>?</span>
                        <span>?</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
    router.push("/");
};
</script>

<style scoped lang="scss">
.error-404 {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.error-container {
    max-width: 800px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 60px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 60px 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.error-content {
    flex: 1;
}

.error-number {
    font-size: 120px;
    font-weight: 900;
    color: #667eea;
    line-height: 1;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
}

.error-description {
    font-size: 18px;
    color: #666;
    margin-bottom: 40px;
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
}

.btn-secondary {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
    }
}

.error-illustration {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.illustration-container {
    position: relative;
    width: 200px;
    height: 200px;
}

.search-icon {
    font-size: 80px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: float 3s ease-in-out infinite;
}

.question-marks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    span {
        position: absolute;
        font-size: 24px;
        color: #667eea;
        font-weight: bold;
        animation: bounce 2s ease-in-out infinite;

        &:nth-child(1) {
            top: 20%;
            left: 20%;
            animation-delay: 0s;
        }

        &:nth-child(2) {
            top: 60%;
            right: 20%;
            animation-delay: 0.5s;
        }

        &:nth-child(3) {
            bottom: 20%;
            left: 50%;
            animation-delay: 1s;
        }
    }
}

@keyframes float {
    0%,
    100% {
        transform: translate(-50%, -50%) translateY(0px);
    }
    50% {
        transform: translate(-50%, -50%) translateY(-10px);
    }
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

// 响应式设计
@media (max-width: 768px) {
    .error-container {
        flex-direction: column;
        gap: 40px;
        padding: 40px 20px;
    }

    .error-number {
        font-size: 80px;
    }

    .error-title {
        font-size: 24px;
    }

    .error-description {
        font-size: 16px;
    }

    .error-actions {
        justify-content: center;
    }

    .illustration-container {
        width: 150px;
        height: 150px;
    }

    .search-icon {
        font-size: 60px;
    }

    .question-marks span {
        font-size: 20px;
    }
}

@media (max-width: 480px) {
    .error-404 {
        padding: 10px;
    }

    .error-container {
        padding: 30px 15px;
    }

    .error-number {
        font-size: 60px;
    }

    .error-title {
        font-size: 20px;
    }

    .error-description {
        font-size: 14px;
    }

    .btn-primary,
    .btn-secondary {
        padding: 10px 20px;
        font-size: 14px;
    }
}
</style>
