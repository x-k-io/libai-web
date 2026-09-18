import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getAuthInfo } from '@/api/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/login/LoginView.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
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
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/throne/user/UserView.vue'),
            meta: { title: '用户管理', icon: 'User' }
          },
          {
            path: 'roles',
            name: 'Roles',
            component: () => import('@/views/throne/role/RoleView.vue'),
            meta: { title: '角色管理', icon: 'UserFilled' }
          },
          {
            path: 'permissions',
            name: 'Permissions',
            component: () => import('@/views/throne/permission/PermissionView.vue'),
            meta: { title: '权限管理', icon: 'Lock' }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

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
  // 确保 v-permission 指令在页面挂载时能读到 permissions
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

  next()
})

export default router
