import { hasPermission } from '@/utils/permission'

/**
 * 权限指令
 * 用法: v-permission="'system:user:create'"
 * 或: v-permission="['system:user:create', 'system:user:update']"
 */
export default {
  mounted(el, binding) {
    const { value } = binding
    
    if (value) {
      const hasAuth = hasPermission(value)
      
      if (!hasAuth) {
        // 没有权限,移除元素
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限标识,如 v-permission="\'system:user:create\'"')
    }
  }
}
