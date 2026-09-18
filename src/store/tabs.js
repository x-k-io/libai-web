import { defineStore } from 'pinia'

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    // 已打开的标签页列表,每个 tab: { path, fullPath, title, name, closable }
    // - path: 路由 path(用于 tab 去重与匹配)
    // - fullPath: 含 query 的完整路径,用于跳转
    // - title: tab 显示的标题,取 route.meta.title
    // - name: 对应路由 name,同时也是 keep-alive include 匹配的组件名
    // - closable: 是否允许关闭(首页仪表盘默认不允许关闭,总是保留)
    tabs: [
      {
        path: '/dashboard',
        fullPath: '/dashboard',
        title: '仪表盘',
        name: 'Dashboard',
        closable: false
      }
    ],
    // 当前激活的 tab(以 fullPath 为唯一标识,避免 query 不同的同一路由冲突)
    activeTab: '/dashboard',
    // keep-alive include 需要的组件名集合(与路由 name 保持一致,同时 View 组件要 defineOptions 设置同名)
    cachedNames: new Set(['Dashboard'])
  }),

  actions: {
    // 根据路由新增一个 tab(若已存在则只激活,不重复加)
    addTab(route) {
      if (!route?.meta?.title || route.path === '/login') return

      const fullPath = route.fullPath || route.path
      const path = route.path
      const title = route.meta.title
      const name = route.name
      const closable = path !== '/dashboard' // 首页不允许关闭

      this.activeTab = fullPath

      // 按 fullPath 去重(query 不同视为不同 tab)
      const exist = this.tabs.find(t => t.fullPath === fullPath)
      if (exist) return

      this.tabs.push({
        path,
        fullPath,
        title,
        name,
        closable
      })

      // 加入缓存集合(同名组件共享缓存,不重复 add)
      if (name) this.cachedNames.add(String(name))
    },

    // 切换激活 tab:target 是 tab 的 fullPath
    setActiveTab(fullPath) {
      this.activeTab = fullPath
    },

    // 关闭指定 tab(target: fullPath),返回关闭后需要跳转的路由 fullPath(如果关的是当前激活 tab)
    closeTab(fullPath) {
      const idx = this.tabs.findIndex(t => t.fullPath === fullPath)
      if (idx === -1) return null

      const tab = this.tabs[idx]
      // 首页不允许关闭
      if (!tab.closable) return null

      // 从 tabs 中移除
      this.tabs.splice(idx, 1)

      // 如果被关闭的 tab 对应的 name 在其他已打开 tab 中没有再使用,从缓存中剔除
      const stillUsed = this.tabs.some(t => t.name === tab.name)
      if (!stillUsed && tab.name) {
        this.cachedNames.delete(String(tab.name))
      }

      // 如果关闭的是当前激活 tab → 找到相邻 tab 跳转
      if (fullPath === this.activeTab) {
        const next = this.tabs[idx] || this.tabs[idx - 1] || this.tabs[0]
        if (next) {
          this.activeTab = next.fullPath
          return next.fullPath
        }
      }
      return null
    },

    // 关闭除了 target 之外的所有标签(保留首页)
    closeOtherTabs(fullPath) {
      const keepTabs = this.tabs.filter(t => !t.closable || t.fullPath === fullPath)
      const keepNames = new Set(keepTabs.map(t => t.name).filter(Boolean))
      this.tabs = keepTabs
      this.cachedNames = keepNames
      if (!keepTabs.find(t => t.fullPath === this.activeTab)) {
        this.activeTab = fullPath
      }
    },

    // 关闭所有可关闭标签(只保留首页),返回需要跳转的首页 fullPath
    closeAllTabs() {
      const home = this.tabs.find(t => !t.closable)
      if (home) {
        this.tabs = [home]
        this.cachedNames = new Set([home.name].filter(Boolean))
        this.activeTab = home.fullPath
        return home.fullPath
      }
      return '/dashboard'
    },

    // 退出登录/切换账号时重置 tabs 为初始状态
    resetTabs() {
      this.tabs = [
        {
          path: '/dashboard',
          fullPath: '/dashboard',
          title: '仪表盘',
          name: 'Dashboard',
          closable: false
        }
      ]
      this.activeTab = '/dashboard'
      this.cachedNames = new Set(['Dashboard'])
    }
  }
})
