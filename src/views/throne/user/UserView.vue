<template>
  <div class="user-management">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.name" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd" v-permission="'system:user:create'">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="200" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
              {{ row.status === 'normal' ? '正常' : (row.status === 'locked' ? '锁定' : (row.status === 'forbidden' ? '禁言' : row.status)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)" v-permission="'system:user:update'">
              修改
            </el-button>
            <el-button link type="warning" size="small" @click="handleResetPwd(row)" v-permission="'system:user:resetPassword'">
              重置密码
            </el-button>
            <el-button
              link
              :type="row.status === 'normal' ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
              v-permission="'system:user:updateStatus'"
            >
              {{ row.status === 'normal' ? '锁定' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="formData.mobile" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="formData.avatar" placeholder="头像 URL" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'Users' })
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, createUser, updateUser, resetPassword, updateUserStatus } from '@/api/user'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const tableData = ref([])

const formData = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  mobile: '',
  avatar: ''
})

// 后端校验: username/name/mobile/email 均 @NotBlank (CreateUserRequest)
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.name || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const response = await getUserList(params)
    console.log('用户列表响应:', response)
    // 后端返回格式: data 是数组,pagination 包含分页信息
    tableData.value = Array.isArray(response.data) ? response.data : (response.data?.records || [])
    pagination.total = Number(response.pagination?.total || response.data?.total || 0)
    console.log('表格数据:', tableData.value, '总数:', pagination.total)
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 重置密码
const handleResetPwd = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户 "${row.username}" 的密码吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await resetPassword(row.id)
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
    }
  }
}

// 切换状态 (UpdateUserStatusRequest: { userId, status }, status 为字符串 normal/locked)
const handleToggleStatus = async (row) => {
  const newStatus = row.status === 'normal' ? 'locked' : 'normal'
  const action = newStatus === 'normal' ? '启用' : '锁定'

  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await updateUserStatus({ userId: row.id, status: newStatus })
    ElMessage.success(`${action}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // UpdateUserRequest: { id, mobile, avatar, email }
          await updateUser({
            id: formData.id,
            mobile: formData.mobile,
            avatar: formData.avatar,
            email: formData.email
          })
          ElMessage.success('更新成功')
        } else {
          // CreateUserRequest: { username, name, mobile, avatar, email }
          await createUser({
            username: formData.username,
            name: formData.name,
            mobile: formData.mobile,
            avatar: formData.avatar,
            email: formData.email
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchUserList()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    username: '',
    name: '',
    email: '',
    mobile: '',
    avatar: ''
  })
}

// 分页
const handleSizeChange = () => {
  fetchUserList()
}

const handleCurrentChange = () => {
  fetchUserList()
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-management {
  .search-form {
    margin-bottom: 20px;
  }
  
  .toolbar {
    margin-bottom: 15px;
  }
}
</style>
