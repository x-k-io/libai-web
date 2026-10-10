/**
 * 动态路由：需要权限校验，Layout子路由
 */
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
