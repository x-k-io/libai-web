<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <h2 v-if="!isCollapse">LibAI Admin</h2>
        <h2 v-else>LA</h2>
      </div>
      <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="theme.sidebarBg"
          :text-color="theme.menuText"
          :active-text-color="theme.menuActiveText"
          router
      >
        <!-- 动态菜单 -->
        <template v-for="menu in menuList" :key="menu.path">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.path">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <template v-for="child in menu.children" :key="child.path">
              <el-menu-item :index="`${menu.path}/${child.path}`">
                <el-icon><component :is="child.icon" /></el-icon>
                <template #title>{{ child.title }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>
          <!-- 没有子菜单 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon><component :is="menu.icon" /></el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航：el‑header内部一行：折叠 | tabs | 主题用户 -->
      <el-header class="header">
        <div class="header-inner">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>

          <!-- tabs栏移入header内部 -->
          <div class="tabs-bar">
            <el-tabs
                v-model="activeTab"
                type="card"
                class="tabs-inner"
                @tab-change="handleTabChange"
                @tab-remove="handleTabRemove"
            >
              <el-tab-pane
                  v-for="tab in tabsStore.tabs"
                  :key="tab.fullPath"
                  :name="tab.fullPath"
                  :closable="tab.closable"
              >
                <template #label>
                  <span class="tab-label">{{ tab.title }}</span>
                </template>
              </el-tab-pane>
            </el-tabs>
            <div class="tabs-actions">
              <el-dropdown @command="handleTabsAction" trigger="click">
                <el-button size="small" text>
                  更多操作 <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
                    <el-dropdown-item command="closeAll">关闭全部</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="header-right">
            <!-- 主题切换 -->
            <el-dropdown @command="handleThemeCommand" trigger="click">
              <span class="theme-switch">
                <el-icon><component :is="theme.icon" /></el-icon>
                <span class="theme-name">{{ theme.name }}</span>
                <el-icon class="arrow"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="item in themeList"
                      :key="item.key"
                      :command="item.key"
                  >
                    <el-icon><component :is="item.icon" /></el-icon>
                    <span>{{ item.name }}</span>
                    <el-icon v-if="item.key === themeKey" class="check"><Check /></el-icon>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                <span>{{ userName }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <!-- 主要内容 -->
      <el-main class="main">
        <router-view v-slot="{ Component, route: viewRoute }">
          <keep-alive :include="cachedNamesArr">
            <component :is="Component" :key="viewRoute.fullPath" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowDown, Check, Moon, Sunny, Fold, Expand, User } from '@element-plus/icons-vue'
import { logout } from '@/api/auth'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import { useTabsStore } from '@/store/tabs'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const tabsStore = useTabsStore()

const theme = computed(() => themeStore.theme)
const themeKey = computed(() => themeStore.themeKey)
const themeList = computed(() => themeStore.themeList)

// keep‑alive include 需要数组,从 Set 转
const cachedNamesArr = computed(() => Array.from(tabsStore.cachedNames))
// tabs v‑model 绑定激活 tab(用 fullPath 做唯一 key)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (val) => tabsStore.setActiveTab(val)
})

const isCollapse = ref(false)
const userName = ref('管理员')
const menuList = ref([])

// 左侧菜单高亮当前路由
const activeMenu = computed(() => route.path)

const handleThemeCommand = (key) => {
  themeStore.setTheme(key)
}

// 点击 tab 切换:路由跳转
const handleTabChange = (fullPath) => {
  if (fullPath && fullPath !== route.fullPath) {
    router.push(fullPath)
  }
}

// 关闭 tab
const handleTabRemove = (fullPath) => {
  const target = tabsStore.closeTab(fullPath)
  if (target && target !== route.fullPath) {
    router.push(target)
  }
}

// 标签栏更多操作:关闭其他/关闭全部
const handleTabsAction = (command) => {
  if (command === 'closeOthers') {
    tabsStore.closeOtherTabs(tabsStore.activeTab)
    if (tabsStore.activeTab !== route.fullPath) {
      router.push(tabsStore.activeTab)
    }
  } else if (command === 'closeAll') {
    const target = tabsStore.closeAllTabs()
    if (target && target !== route.fullPath) {
      router.push(target)
    }
  }
}

// 根据权限生成菜单
const generateMenu = (permissions) => {
  const allMenus = [
    {
      path: '/dashboard',
      title: '仪表盘',
      icon: 'Odometer',
      permission: null
    },
    {
      path: '/system',
      title: '系统管理',
      icon: 'Setting',
      permission: null,
      children: [
        { path: 'users', title: '用户管理', icon: 'User', permission: 'system:user' },
        { path: 'roles', title: '角色管理', icon: 'UserFilled', permission: 'system:role' },
        { path: 'permissions', title: '权限管理', icon: 'Lock', permission: 'system:permission' }
      ]
    }
  ]

  if (!permissions || permissions.length === 0) {
    return allMenus
  }

  return allMenus.map(menu => {
    if (!menu.children || menu.children.length === 0) {
      if (!menu.permission || permissions.includes(menu.permission)) {
        return menu
      }
      return null
    }
    const filteredChildren = menu.children.filter(child => {
      return !child.permission || permissions.includes(child.permission)
    })
    if (filteredChildren.length > 0) {
      return { ...menu, children: filteredChildren }
    }
    return null
  }).filter(menu => menu !== null)
}

const renderUserInfo = () => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    userName.value = userInfo.name || userInfo.nickname || userInfo.mobile || '管理员'
    menuList.value = generateMenu(userInfo.permissions || [])
  } else {
    menuList.value = generateMenu([])
  }
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
    return
  }
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await logout({ refreshToken: userStore.refreshToken })
      userStore.logout()
      tabsStore.resetTabs()
      router.push('/login')
    } catch (error) {
      // 取消操作
    }
  }
}

// 监听 userInfo 变化，更新菜单和用户信息
watch(
  () => userStore.userInfo,
  () => {
    renderUserInfo()
  },
  { immediate: true }
)

watch(
    () => route.fullPath,
    () => {
      tabsStore.addTab(route)
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.aside {
  background-color: v-bind('theme.sidebarBg');
  transition: width 0.3s, background-color 0.4s;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: v-bind('theme.sidebarLogoBg');

    h2 {
      color: v-bind('theme.menuActiveText');
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      opacity: 0.95;
    }
  }

  .el-menu {
    border-right: none;
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    background-color: v-bind('theme.menuHoverBg') !important;
  }

  :deep(.el-menu--inline) {
    background-color: v-bind('theme.submenuBg') !important;
  }

  :deep(.el-menu-item.is-active) {
    color: v-bind('theme.menuActiveText') !important;
  }
}

.header {
  background-color: v-bind('theme.headerBg');
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 12px;
  transition: background-color 0.4s;

  .header-inner {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 10px;

    .header-left {
      flex-shrink: 0;
      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
        color: v-bind('theme.headerText');
        transition: color 0.3s;
        &:hover {
          color: v-bind('theme.collapseHover');
        }
      }
    }

    .tabs-bar {
      flex: 1;
      display: flex;
      align-items: stretch; /* 重点：由 center → stretch，让tab子元素纵向撑满 */
      min-width: 0;

      .tabs-inner {
        flex: 1;
        :deep(.el-tabs__nav-wrap::after) {
          height: 0;
        }
        :deep(.el-tabs__header) {
          margin: 0;
        }
        // 关键：让tab header高度100%撑满父容器
        :deep(.el-tabs__nav-wrap) {
          height: 100%;
        }
        :deep(.el-tabs__nav) {
          height:100%;
        }
        :deep(.el-tabs__item) {
          height: 100%; // 不要写固定34px，改为100%继承父高度
          line-height: 34px;
          font-size: 13px;
          padding: 0 14px;
          border-radius: 6px 6px 0 0;
          color: v-bind('theme.headerText');
          opacity: 0.85;
          .tab-label {
            user-select: none;
          }
          &.is-active {
            background-color: v-bind('theme.mainBg');
            opacity: 1;
            font-weight: 500;
          }
          .el-icon-close {
            font-size: 12px;
            margin-left: 4px;
          }
        }
      }
      .tabs-actions {
        flex-shrink: 0;
        display:flex;
        align-items:center; // 按钮垂直居中
        :deep(.el-button) {
          color: v-bind('theme.headerText');
          opacity: 0.85;
        }
      }
    }
    .header-right {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 16px;

      .theme-switch {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 6px;
        color: v-bind('theme.headerText');
        transition: background-color 0.3s;
        font-size: 13px;
        &:hover {
          background-color: v-bind('theme.userHoverBg');
        }
        .arrow {
          font-size: 12px;
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 6px;
        color: v-bind('theme.headerText');
        transition: background-color 0.3s;
        &:hover {
          background-color: v-bind('theme.userHoverBg');
        }
      }
    }
  }
}

.main {
  background-color: v-bind('theme.mainBg');
  padding: 20px;
  transition: background-color 0.4s;
  overflow: auto;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  .check {
    margin-left: auto;
    color: #409eff;
  }
}
</style>
