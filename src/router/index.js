import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getAuthInfo } from '@/api/auth'

// 静态路由：不需要特定权限，所有登录用户都可访问
export const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/login/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/common/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/common/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/common/profile/ProfileView.vue'),
        meta: { title: '个人信息' }
      }
    ]
  }
]

// 动态路由：需要根据用户权限动态加载（作为 Layout 的子路由）
export const dynamicRoutes = [
  {
    path: 'system',
    name: 'System',
    redirect: '/system/users',
    meta: { title: '系统管理', icon: 'Setting', permission: 'system:manager' },
    children: [
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/throne/user/UserView.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'system:user' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/throne/role/RoleView.vue'),
        meta: { title: '角色管理', icon: 'UserFilled', permission: 'system:role' }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/throne/permission/PermissionView.vue'),
        meta: { title: '权限管理', icon: 'Lock', permission: 'system:permission' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes
})

// 标记动态路由是否已添加
let dynamicRoutesAdded = false

// 重置路由，清除所有动态添加的路由
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: staticRoutes
  })
  router.matcher = newRouter.matcher
  dynamicRoutesAdded = false
}

// 递归过滤动态路由，根据用户权限精确控制每个子路由的访问
function filterAsyncRoutes(routes, perms) {
  const res = []
  routes.forEach(route => {
    // 如果路由没有 permission 标识，或者用户有该权限，则保留
    if (!route.meta?.permission || perms.includes(route.meta.permission)) {
      const temp = { ...route }
      if (temp.children) {
        temp.children = filterAsyncRoutes(temp.children, perms)
        // 子路由过滤完为空，不保留父菜单
        if (temp.children.length === 0) return
      }
      res.push(temp)
    }
  })
  return res
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.path === '/login' && token) {
    next('/')
    return
  }

  // 已登录但 userInfo 尚未加载(如刷新页面),先拉取用户信息
  if (token && !userStore.userInfo) {
    try {
      const response = await getAuthInfo()
      if (response.data) {
        userStore.setUserInfo(response.data)
      }
    } catch (error) {
      // 获取用户信息失败(如 token 失效),跳转登录
      userStore.logout()
      next('/login')
      return
    }
  }

  // 根据权限动态添加路由（每次导航都检查，确保登录后立即生效）
  if (token && userStore.userInfo && !dynamicRoutesAdded) {
    const permissions = userStore.userInfo.permissions || []
    // 递归过滤动态路由，只注册用户有权限的路由
    const accessRoutes = filterAsyncRoutes(dynamicRoutes, permissions)
    if (accessRoutes.length > 0) {
      accessRoutes.forEach(route => {
        router.addRoute('Layout', route)
      })
      dynamicRoutesAdded = true

      // 动态路由刚添加，重新导航以匹配新路由
      next({ path: to.path, query: to.query, replace: true })
      return
    }
  }

  next()
})

export default router
