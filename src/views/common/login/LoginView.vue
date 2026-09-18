<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">LibAI Admin</h2>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
      >
        <el-form-item prop="loginName">
          <el-input
            v-model="loginForm.loginName"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { md5 } from 'js-md5'
import { login, getAuthInfo } from '@/api/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

// 后端 AdminLoginRequest 仅包含 loginName 和 password
// password 需传 MD5 值(与后端 create 时存储的 BCrypt(MD5(password)) 对应)
const loginForm = reactive({
  loginName: '',
  password: ''
})

const loginRules = {
  loginName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 1. 登录获取 token (返回 UserTokenVo: { accessToken, refreshToken, accessExpire })
        const response = await login({
          loginName: loginForm.loginName,
          password: md5(loginForm.password)
        })
        const userToken = response.data || {}

        userStore.setToken(userToken)

        // 2. 获取用户信息
        const authResponse = await getAuthInfo()
        userStore.setUserInfo(authResponse.data)

        ElMessage.success('登录成功')

        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  
  .login-title {
    text-align: center;
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
