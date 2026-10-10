import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getAuthInfo } from '@/api/auth'
import { staticRoutes } from './static-routes'
import { dynamicRoutes } from './dynamic-routes'

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
    }
    // 注册 404 兜底路由（必须在动态路由之后注册，否则会拦截所有路由）
    router.addRoute({
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/common/404/NotFoundView.vue'),
      meta: { title: '页面不存在', requiresAuth: false }
    })
    dynamicRoutesAdded = true

    // 动态路由刚添加，重新导航以匹配新路由
    if (accessRoutes.length > 0) {
      next({ path: to.path, query: to.query, replace: true })
      return
    }
  }

  next()
})

export default router
