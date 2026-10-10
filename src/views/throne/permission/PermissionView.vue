<template>
  <div class="permission-management">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="权限名">
          <el-input v-model="searchForm.name" placeholder="请输入权限名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd" v-permission="'system:permission:create'">
          <el-icon><Plus /></el-icon>
          添加权限
        </el-button>
        <el-button @click="handleExpandAll">展开/折叠全部</el-button>
      </div>

      <!-- 树形表格 -->
      <el-table 
        ref="tableRef"
        :data="tableData" 
        border 
        stripe 
        v-loading="loading" 
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="name" label="权限名称" min-width="200" />
        <el-table-column prop="permission" label="权限标识" min-width="180"/>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)" v-permission="'system:permission:update'">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)" v-permission="'system:permission:delete'">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>


    </el-card>

    <!-- 添加/修改对话框 -->
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
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" :disabled="isEdit" placeholder="如 system:user:create" />
        </el-form-item>
        <el-form-item label="上级权限" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="parentTreeData"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            filterable
            check-strictly
            :clearable="false"
            :disabled="isEdit"
            style="width: 100%"
            placeholder="请选择上级权限"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
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
defineOptions({ name: 'Permissions' })
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllPermissions, createPermission, updatePermission, deletePermission } from '@/api/permission'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const tableRef = ref(null)

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const tableData = ref([])
const parentTreeData = ref([])

// 构建用于上级选择的树形数据,包含一个根节点选项(id=0)
const buildParentTree = (permissions, excludeId = null) => {
  const map = {}
  const tree = []
  permissions.forEach(perm => {
    // 编辑时排除自身,避免选自己为上级
    if (excludeId != null && perm.id === excludeId) return
    map[perm.id] = { ...perm, children: [] }
  })
  permissions.forEach(perm => {
    if (excludeId != null && perm.id === excludeId) return
    const node = map[perm.id]
    if (perm.parentId && map[perm.parentId]) {
      map[perm.parentId].children.push(node)
    } else {
      tree.push(node)
    }
  })
  // 顶部加入一个"根节点"选项,表示 parentId = 0
  return [
    { id: 0, name: '根节点 (无上级)', children: tree }
  ]
}

// 加载上级下拉树数据
const loadParentTree = async (excludeId = null) => {
  try {
    const response = await getAllPermissions()
    const permissions = Array.isArray(response.data) ? response.data : []
    parentTreeData.value = buildParentTree(permissions, excludeId)
  } catch (error) {
    console.error('加载上级权限树失败:', error)
  }
}

// 将扁平权限列表转换为树形结构(后端 /permissions/list 返回扁平 List<PermissionVo>)
const buildPermissionTree = (permissions) => {
  const map = {}
  const tree = []
  permissions.forEach(perm => {
    map[perm.id] = { ...perm, children: [] }
  })
  permissions.forEach(perm => {
    const node = map[perm.id]
    if (perm.parentId && map[perm.parentId]) {
      map[perm.parentId].children.push(node)
    } else {
      tree.push(node)
    }
  })
  return tree
}

const formData = reactive({
  id: null,
  name: '',
  permission: '',
  parentId: 0,
  sortOrder: 0
})

const formRules = {
  name: [{ required: true, message: '请输入权限名', trigger: 'blur' }],
  parentId: [{ required: true, message: '请输入上级ID', trigger: 'blur' }]
}

// 获取权限列表（后端 /permissions/list 返回扁平数组,前端构建树形结构）
const fetchPermissionList = async () => {
  loading.value = true
  try {
    const response = await getAllPermissions()
    const permissions = Array.isArray(response.data) ? response.data : []
    // 按名称在前端做过滤(/list 不支持 name 参数)
    const keyword = searchForm.name?.trim()
    const filtered = keyword
      ? permissions.filter(p => (p.name || '').includes(keyword) || (p.permission || '').includes(keyword))
      : permissions
    tableData.value = buildPermissionTree(filtered)
  } catch (error) {
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchPermissionList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

// 展开/折叠全部
const handleExpandAll = () => {
  if (!tableRef.value || tableData.value.length === 0) return

  // 从表格内部store读取第一条节点真实展开状态
  const treeData = tableRef.value.store.states.treeData.value
  const firstNodeId = tableData.value[0].id
  const currentExpanded = treeData[firstNodeId]?.expanded ?? true
  // 当前如果是展开 → 需要全部折叠；反之全部展开
  const targetExpand = !currentExpanded

  const expandOrCollapse = (data) => {
    data.forEach(item => {
      tableRef.value.toggleRowExpansion(item, targetExpand)
      if (item.children && item.children.length > 0) {
        expandOrCollapse(item.children)
      }
    })
  }
  expandOrCollapse(tableData.value)
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加权限'
  formData.parentId = 0
  loadParentTree()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '修改权限'
  Object.assign(formData, row)
  // 编辑时排除自身,避免选自己为上级
  loadParentTree(row.id)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除权限 "${row.name}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deletePermission(row.id)
    ElMessage.success('删除成功')
    fetchPermissionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
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
          // UpdatePermissionRequest: { id, name, sortOrder } (parentId、permission 不可修改)
          await updatePermission({
            id: formData.id,
            name: formData.name,
            sortOrder: formData.sortOrder
          })
          ElMessage.success('更新成功')
        } else {
          // CreatePermissionRequest: { parentId, name, permission, sortOrder }
          await createPermission({
            parentId: formData.parentId,
            name: formData.name,
            permission: formData.permission,
            sortOrder: formData.sortOrder
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchPermissionList()
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
    name: '',
    permission: '',
    parentId: 0,
    sortOrder: 0
  })
}

onMounted(() => {
  fetchPermissionList()
})
</script>

<style scoped lang="scss">
.permission-management {
  .search-form {
    margin-bottom: 20px;
  }
  
  .toolbar {
    margin-bottom: 15px;
  }
}
</style>
