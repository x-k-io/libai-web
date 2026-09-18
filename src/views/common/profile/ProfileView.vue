<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 左侧个人简介卡片 -->
      <el-card class="profile-sidebar-card" shadow="never">
        <div class="sidebar-inner">
          <el-avatar class="sidebar-avatar" :size="110" :icon="UserFilled" />
          <h2 class="sidebar-name">{{ displayName }}</h2>
          <p class="sidebar-login">登录名：{{ userInfo?.loginName || '—' }}</p>
          <div class="divider-line"></div>
          <el-button type="primary" class="pwd-btn" @click="openPasswordDialog">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </el-button>
        </div>
      </el-card>

      <!-- 右侧信息区域 -->
      <div class="profile-main">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header-wrap">
              <el-icon class="header-icon"><User /></el-icon>
              <span class="header-title">基本信息</span>
            </div>
          </template>

          <!-- 改为标准两列资料展示，不再用一个个灰色小方块 -->
          <div class="info-table-layout">
            <div class="info-row">
              <div class="info-label">
                <el-icon><CreditCard /></el-icon>
                用户ID
              </div>
              <div class="info-value">{{ userInfo?.id || '—' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Avatar /></el-icon>
                登录名
              </div>
              <div class="info-value">{{ userInfo?.loginName || '—' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><User /></el-icon>
                姓名
              </div>
              <div class="info-value">{{ userInfo?.name || '—' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><EditPen /></el-icon>
                昵称
              </div>
              <div class="info-value">{{ userInfo?.nickname || '—' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Phone /></el-icon>
                手机号
              </div>
              <div class="info-value">{{ userInfo?.mobile || '—' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                <el-icon><Message /></el-icon>
                邮箱
              </div>
              <div class="info-value">{{ userInfo?.email || '—' }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        width="480px"
        destroy-on-close
        @close="resetPasswordForm"
    >
      <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="至少6位字符"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handlePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  User,
  Avatar,
  CreditCard,
  EditPen,
  Phone,
  Message,
  Lock
} from '@element-plus/icons-vue'
import { md5 } from 'js-md5'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import { updatePassword } from '@/api/user'

defineOptions({ name: 'Profile' })

const userStore = useUserStore()
const themeStore = useThemeStore()

const userInfo = computed(() => userStore.userInfo)

const displayName = computed(() => {
  const info = userStore.userInfo
  return info?.name || info?.nickname || info?.loginName || '管理员'
})

const headerIconColor = computed(() => themeStore.theme?.primary || '#409eff')

// ---- 修改密码逻辑完全不变 ----
const passwordFormRef = ref(null)
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const openPasswordDialog = () => {
  passwordDialogVisible.value = true
}

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordFormRef.value?.clearValidate()
}

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    await updatePassword({
      oldPassword: md5(passwordForm.value.oldPassword),
      newPassword: md5(passwordForm.value.newPassword)
    })
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
  } catch (error) {
    if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  padding: 8px 0;

  .profile-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  // 左侧侧边卡片
  .profile-sidebar-card {
    border-radius: 16px;
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);

    .sidebar-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px 20px;

      .sidebar-avatar {
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        background-color: #f5f7fa;
      }

      .sidebar-name {
        margin: 20px 0 6px;
        font-size: 22px;
        font-weight: 600;
        color: #1f2329;
      }

      .sidebar-login {
        margin:0;
        font-size:14px;
        color:#86909c;
      }

      .divider-line {
        width: 100%;
        height: 1px;
        background: #e5e6eb;
        margin:24px 0;
      }

      .pwd-btn {
        width: 100%;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:6px;
      }
    }
  }

  // 右侧主信息卡片
  .profile-main {
    .info-card {
      border-radius: 16px;
      box-shadow: 0 2px 14px rgba(0, 0, 0, 0.05);

      .card-header-wrap {
        display: flex;
        align-items: center;
        gap:8px;

        .header-icon {
          font-size:18px;
          color: v-bind('headerIconColor');
        }
        .header-title {
          font-size:17px;
          font-weight:600;
          color:#1f2329;
        }
      }

      // 两列资料布局，替代之前一堆灰色小方块
      .info-table-layout {
        display: grid;
        grid-template-columns: repeat(2, 1fr);

        @media (max-width:720px) {
          grid-template-columns: 1fr;
        }

        .info-row {
          display: flex;
          padding: 18px 4px;
          border-bottom: 1px solid #f0f0f2;

          &:nth-last-child(-n+2) {
            border-bottom: none;
          }

          .info-label {
            width: 120px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #86909c;
          }

          .info-value {
            flex: 1;
            font-size: 14px;
            color: #1f2329;
            word-break: break-all;
          }
        }
      }
    }
  }
}
</style>
