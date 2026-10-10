<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <!-- 插画区域 -->
      <div class="illustration">
        <svg width="320" height="220" viewBox="0 0 320 220" fill="none">
          <circle cx="160" cy="110" r="90" fill="#e8f3ff"/>
          <path d="M120 90 L140 130 L180 130 L200 90" stroke="#409eff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="135" cy="80" r="8" fill="#409eff"/>
          <circle cx="185" cy="80" r="8" fill="#409eff"/>
          <path d="M145 115 Q160 130 175 115" stroke="#409eff" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <p class="error-tip">可能地址输入错误，或该页面暂无访问权限</p>
      <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef5ff 100%);
}

.not-found-content {
  text-align: center;
  padding: 20px;

  .illustration {
    margin-bottom: 12px;
    animation: float 3s ease-in-out infinite;
  }

  .error-code {
    font-size: 120px;
    font-weight: 700;
    color: #409eff;
    margin: 0;
    line-height: 1;
    text-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  .error-message {
    font-size: 22px;
    color: #303133;
    margin: 16px 0 8px;
  }

  .error-tip {
    font-size: 15px;
    color: #909399;
    margin: 0 0 40px;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
