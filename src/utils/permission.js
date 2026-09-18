import { useUserStore } from '@/store/user'

/**
 * 检查用户是否有指定权限
 * @param {string|string[]} permission - 权限标识,可以是字符串或数组
 * @returns {boolean} 是否有权限
 */
export function hasPermission(permission) {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo

  // 如果没有用户信息,默认没有权限(安全起见)
  if (!userInfo || !userInfo.permissions) {
    return false
  }

  const userPermissions = userInfo.permissions

  // 如果传入的是数组,只要有一个权限匹配就返回 true
  if (Array.isArray(permission)) {
    return permission.some(p => userPermissions.includes(p))
  }

  // 如果传入的是字符串,直接检查
  return userPermissions.includes(permission)
}

/**
 * 检查用户是否有任意一个权限
 * @param {string[]} permissions - 权限标识数组
 * @returns {boolean}
 */
export function hasAnyPermission(permissions) {
  if (!permissions || permissions.length === 0) return true

  const userStore = useUserStore()
  const userInfo = userStore.userInfo

  if (!userInfo || !userInfo.permissions) {
    return false
  }

  return permissions.some(p => userInfo.permissions.includes(p))
}

/**
 * 检查用户是否有所有权限
 * @param {string[]} permissions - 权限标识数组
 * @returns {boolean}
 */
export function hasAllPermissions(permissions) {
  if (!permissions || permissions.length === 0) return true

  const userStore = useUserStore()
  const userInfo = userStore.userInfo

  if (!userInfo || !userInfo.permissions) {
    return false
  }

  return permissions.every(p => userInfo.permissions.includes(p))
}
