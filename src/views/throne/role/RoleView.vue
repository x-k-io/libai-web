<template>
  <div class="role-management">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名">
          <el-input v-model="searchForm.name" placeholder="请输入角色名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd" v-permission="'system:role:create'">
          <el-icon><Plus /></el-icon>
          添加角色
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="200" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" label="编码" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="warning" size="small" @click="handleSetPermission(row)" v-permission="'system:role:assign'">
              分配权限
            </el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)" v-permission="'system:role:update'">
              修改
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)" v-permission="'system:role:delete'">
              删除
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 设置权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="设置权限"
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <el-tree
        ref="treeRef"
        :key="permissionTreeKey"
        :data="permissionTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
        style="max-height: 400px; overflow-y: auto"
      />
      
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission" :loading="permissionLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({ name: 'Roles' })
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole, getRolePermissions, updateRolePermission } from '@/api/role'
import { getAllPermissions } from '@/api/permission'

const loading = ref(false)
const submitLoading = ref(false)
const permissionLoading = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const treeRef = ref(null)

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const tableData = ref([])
const permissionTree = ref([])
const permissionTreeKey = ref(0)
const currentRoleId = ref(null)

const formData = reactive({
  id: null,
  name: '',
  code: '',
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

// 将扁平权限列表转换为树形结构
const buildPermissionTree = (permissions) => {
  const map = {}
  const tree = []
  
  // 创建映射
  permissions.forEach(perm => {
    map[perm.id] = { ...perm, children: [] }
  })
  
  // 构建树形结构
  permissions.forEach(perm => {
    const node = map[perm.id]
    if (perm.parentId && map[perm.parentId]) {
      // 有父节点,添加到父节点的 children
      map[perm.parentId].children.push(node)
    } else {
      // 没有父节点,是根节点
      tree.push(node)
    }
  })
  
  return tree
}

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.name || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const response = await getRoleList(params)
    console.log('角色列表响应:', response)
    // 后端返回格式: data 是数组,pagination 包含分页信息
    tableData.value = Array.isArray(response.data) ? response.data : (response.data?.records || [])
    pagination.total = Number(response.pagination?.total || response.data?.total || 0)
    console.log('表格数据:', tableData.value, '总数:', pagination.total)
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchRoleList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 从权限树中收集所有真实存在的权限 ID(包括所有层级)
const collectAllPermissionIds = (nodes) => {
  const ids = new Set()
  const walk = (list) => {
    if (!list) return
    list.forEach(node => {
      if (node.id != null) ids.add(String(node.id))
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children)
      }
    })
  }
  walk(nodes)
  return ids
}

// 建立 id -> node 的快速查找索引
const buildNodeIndex = (nodes) => {
  const index = new Map()
  const walk = (list) => {
    if (!list) return
    list.forEach(node => {
      if (node.id != null) index.set(String(node.id), node)
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children)
      }
    })
  }
  walk(nodes)
  return index
}

// 判断节点是否为叶子节点
const isLeafNode = (node) => {
  return !Array.isArray(node.children) || node.children.length === 0
}

// 收集某节点下所有叶子节点的 ID(若自身为叶子则包含自身)
const collectLeafIdsOf = (node) => {
  const result = []
  const walk = (n) => {
    if (isLeafNode(n)) {
      result.push(String(n.id))
    } else if (Array.isArray(n.children)) {
      n.children.forEach(walk)
    }
  }
  walk(node)
  return result
}

// 回填关键:将「全选节点 + 半选父节点」的混合集合"规范化"为 setCheckedKeys 能安全使用的集合:
// - 叶子节点: 直接保留(用户明确勾选的权限点)
// - 非叶子节点(父节点):
//   * 若其下所有叶子节点都出现在 rawIds 中 → 是"真正的全选父节点",保留(setCheckedKeys 后仍等价于全选子节点,语义正确)
//   * 否则 → 只是"半选路径节点"(只因为部分子节点被勾选而进入 halfCheckedKeys),直接丢弃
//     (父节点的半选状态会由 el-tree 根据保留下来的子节点自动推导,不会扩散为全选子节点)
// - 不存在于权限树的"幽灵 ID": 丢弃
const normalizeCheckedKeysForSet = (treeNodes, rawIds) => {
  const nodeIndex = buildNodeIndex(treeNodes)
  const rawSet = new Set(rawIds.map(id => String(id)))
  const result = []

  rawSet.forEach(idStr => {
    const node = nodeIndex.get(idStr)
    if (!node) return // 幽灵 ID,丢弃

    if (isLeafNode(node)) {
      result.push(idStr)
    } else {
      // 非叶子节点:检查其下每一片叶子是否都包含在 rawIds 中
      const allLeaves = collectLeafIdsOf(node)
      const allLeavesInRaw = allLeaves.every(leafId => rawSet.has(leafId))
      if (allLeavesInRaw) {
        result.push(idStr) // 真正的全选父节点,保留
      }
      // 否则是半选路径节点,不保留(前端联动会自动推导半选状态,避免级联误选)
    }
  })

  return result
}

// 设置权限(保存沿用 pigx 的 checked+half 对称入库;回填时先规范化再 setCheckedKeys,避免半选父扩散)
const handleSetPermission = async (row) => {
  currentRoleId.value = row.id
  
  try {
    // 获取所有权限
    const permResponse = await getAllPermissions()
    
    // 将扁平数据转换为树形结构
    const permissions = Array.isArray(permResponse.data) ? permResponse.data : (permResponse.data?.records || [])
    permissionTree.value = buildPermissionTree(permissions)
    
    // 获取当前角色的权限
    const rolePermResponse = await getRolePermissions(row.id)
    const rawCheckedKeys = rolePermResponse.data || []
    
    // 步骤 1:规范化回填集合(剔幽灵 ID + 剔半选路径父节点)
    // 根因修复:避免只是"半选路径"的父节点(如权限管理)被 setCheckedKeys 后,
    // 因父子联动把其下所有现存子节点(含未分配的"测试")错误全选。
    const normalizedKeys = normalizeCheckedKeysForSet(permissionTree.value, rawCheckedKeys)
    
    // 步骤 2:更新 key 强制 el-tree 组件完全重建,彻底清空内部缓存
    permissionTreeKey.value++
    
    permissionDialogVisible.value = true
    
    // 步骤 3:先显式清空,再回填(避免依赖初始化副作用)
    await nextTick()
    await nextTick() // key 变更后组件销毁并重建需要两次 tick
    if (treeRef.value) {
      treeRef.value.setCheckedKeys([])
      await nextTick()
      treeRef.value.setCheckedKeys(normalizedKeys)
    }
  } catch (error) {
    console.error('获取权限失败:', error)
  }
}

// 权限对话框关闭时清理状态
const handlePermissionDialogClose = () => {
  permissionTreeKey.value++
  currentRoleId.value = null
}

// 保存权限(沿用 pigx 实现:合并全选节点 + 半选父节点后入库,用于后端快速鉴权/构建路径)
const handleSavePermission = async () => {
  if (!treeRef.value) return
  
  permissionLoading.value = true
  try {
    const checkedKeys = treeRef.value.getCheckedKeys()
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    
    console.log('选中节点ID:', checkedKeys)
    console.log('半选父节点ID:', halfCheckedKeys)
    console.log('合并后保存的权限ID:', allKeys)
    
    await updateRolePermission({
      roleId: currentRoleId.value,
      permissionIds: allKeys
    })
    
    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存权限失败:', error)
  } finally {
    permissionLoading.value = false
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
          // UpdateRoleRequest: { id, name, description } (code 不可修改)
          await updateRole({
            id: formData.id,
            name: formData.name,
            description: formData.description
          })
          ElMessage.success('更新成功')
        } else {
          // CreateRoleRequest: { code, name, description }
          await createRole({
            code: formData.code,
            name: formData.name,
            description: formData.description
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchRoleList()
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
    code: '',
    description: ''
  })
}

// 分页
const handleSizeChange = () => {
  fetchRoleList()
}

const handleCurrentChange = () => {
  fetchRoleList()
}

onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped lang="scss">
.role-management {
  .search-form {
    margin-bottom: 20px;
  }
  
  .toolbar {
    margin-bottom: 15px;
  }
}
</style>
