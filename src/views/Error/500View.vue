<template>
    <div class="error-500">
        <div class="error-container">
            <div class="error-content">
                <div class="error-number">500</div>
                <div class="error-title">系统异常</div>
                <div class="error-description">抱歉，系统出现了意外错误，请稍后重试</div>
                <div class="error-actions">
                    <button class="btn-primary" @click="goHome">
                        <i class="icon-home"></i>
                        返回首页
                    </button>
                </div>
            </div>
            <div class="error-illustration">
                <div class="illustration-container">
                    <div class="warning-icon">⚠️</div>
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

const refresh = () => {
    window.location.reload();
};
</script>

<style scoped lang="scss">
.error-500 {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%);
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
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
}

.error-content {
    flex: 1;
}

.error-number {
    font-size: 120px;
    font-weight: 900;
    color: #ff4b2b;
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
    background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%);
    color: white;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 75, 43, 0.4);
    }
}

.btn-secondary {
    background: transparent;
    color: #ff4b2b;
    border: 2px solid #ff4b2b;

    &:hover {
        background: #ff4b2b;
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

.warning-icon {
    font-size: 80px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: shake 2s ease-in-out infinite;
}

.error-marks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    span {
        position: absolute;
        font-size: 24px;
        color: #ff4b2b;
        font-weight: bold;
        animation: pulse 2s ease-in-out infinite;

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

@keyframes shake {
    0%, 100% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translate(-50%, -50%) rotate(-5deg);
    }
    20%, 40%, 60%, 80% {
        transform: translate(-50%, -50%) rotate(5deg);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.7;
    }
}

@media (max-width: 768px) {
    .error-container {
        flex-direction: column-reverse;
        text-align: center;
        padding: 40px 20px;
        gap: 30px;
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

    .error-illustration {
        margin-bottom: 20px;
    }
}
</style>]]>
