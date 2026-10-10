/**
 * 静态路由：无需权限，基础路由
 */
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
