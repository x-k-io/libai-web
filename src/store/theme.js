import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 主题配色方案定义
const THEMES = {
  // ========== 深色侧栏主题 ==========

  // 经典深蓝
  'deep-blue': {
    name: '经典深蓝',
    icon: 'Moon',
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#304156',
    sidebarLogoBg: '#2b3a4c',
    menuText: '#bfcbd9',
    menuActiveText: '#409eff',
    menuHoverBg: '#263445',
    submenuBg: '#1f2d3d',
    headerBg: '#ffffff',
    headerText: '#303133',
    mainBg: '#f0f2f5',
    collapseHover: '#409eff',
    userHoverBg: '#f5f7fa'
  },
  // 翠绿森林
  emerald: {
    name: '翠绿森林',
    icon: 'Moon',
    primary: '#4dd882',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#1b3a32',
    sidebarLogoBg: '#153028',
    menuText: '#a8c8b8',
    menuActiveText: '#4dd882',
    menuHoverBg: '#224840',
    submenuBg: '#142820',
    headerBg: '#f8fdf8',
    headerText: '#2d4a2d',
    mainBg: '#f0f5f0',
    collapseHover: '#4dd882',
    userHoverBg: '#e8f5e8'
  },
  // 雅致紫调
  'royal-purple': {
    name: '雅致紫调',
    icon: 'Moon',
    primary: '#b388ff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#2d2040',
    sidebarLogoBg: '#241930',
    menuText: '#c0b0e0',
    menuActiveText: '#b388ff',
    menuHoverBg: '#3a2858',
    submenuBg: '#221530',
    headerBg: '#ffffff',
    headerText: '#3d2d5c',
    mainBg: '#f5f0fa',
    collapseHover: '#b388ff',
    userHoverBg: '#f0e8fa'
  },
  // 暖橙日落
  'sunset-orange': {
    name: '暖橙日落',
    icon: 'Sunny',
    primary: '#f0a050',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#3d2e1f',
    sidebarLogoBg: '#332518',
    menuText: '#d4c4a0',
    menuActiveText: '#f0a050',
    menuHoverBg: '#4d3a26',
    submenuBg: '#2d2015',
    headerBg: '#fffbf5',
    headerText: '#5c4030',
    mainBg: '#faf5f0',
    collapseHover: '#f0a050',
    userHoverBg: '#fdf0e0'
  },
  // 深海青蓝
  'ocean-teal': {
    name: '深海青蓝',
    icon: 'Moon',
    primary: '#2cb6ce',
    success: '#5cdb8a',
    warning: '#f0a84c',
    danger: '#ff6b6b',
    sidebarBg: '#0d3b40',
    sidebarLogoBg: '#0a2e33',
    menuText: '#9cc8d0',
    menuActiveText: '#2cb6ce',
    menuHoverBg: '#124a50',
    submenuBg: '#082830',
    headerBg: '#f5fcfd',
    headerText: '#1a4a50',
    mainBg: '#f0f8fa',
    collapseHover: '#2cb6ce',
    userHoverBg: '#e0f5f8'
  },
  // 玫红绮丽
  'crimson-rose': {
    name: '玫红绮丽',
    icon: 'Sunny',
    primary: '#e74c8b',
    success: '#5cdb8a',
    warning: '#f0a84c',
    danger: '#f56c6c',
    sidebarBg: '#3d1520',
    sidebarLogoBg: '#330f1a',
    menuText: '#d8b0c0',
    menuActiveText: '#e74c8b',
    menuHoverBg: '#501e2a',
    submenuBg: '#2d0e18',
    headerBg: '#fff8fb',
    headerText: '#5c1a30',
    mainBg: '#fdf2f6',
    collapseHover: '#e74c8b',
    userHoverBg: '#fce8f0'
  },
  // 石墨灰调
  'graphite-gray': {
    name: '石墨灰调',
    icon: 'Moon',
    primary: '#5b8def',
    success: '#5cdb8a',
    warning: '#f0a84c',
    danger: '#ff6b6b',
    sidebarBg: '#2a2a2e',
    sidebarLogoBg: '#222226',
    menuText: '#a0a0a8',
    menuActiveText: '#5b8def',
    menuHoverBg: '#363640',
    submenuBg: '#202024',
    headerBg: '#ffffff',
    headerText: '#303033',
    mainBg: '#f2f2f5',
    collapseHover: '#5b8def',
    userHoverBg: '#f0f0f5'
  },
  // 暖棕大地
  'warm-earth': {
    name: '暖棕大地',
    icon: 'Sunny',
    primary: '#c4853f',
    success: '#7ab84a',
    warning: '#e6a23c',
    danger: '#d4504a',
    sidebarBg: '#3a2a1a',
    sidebarLogoBg: '#2e2012',
    menuText: '#d0b898',
    menuActiveText: '#c4853f',
    menuHoverBg: '#4a3825',
    submenuBg: '#2a1d12',
    headerBg: '#fdfaf5',
    headerText: '#4a3020',
    mainBg: '#faf6f0',
    collapseHover: '#c4853f',
    userHoverBg: '#f5ece0'
  },
  // 静谧墨蓝
  'ink-blue': {
    name: '静谧墨蓝',
    icon: 'Moon',
    primary: '#3d7fff',
    success: '#5cdb8a',
    warning: '#f0a84c',
    danger: '#ff6b6b',
    sidebarBg: '#1a2a5c',
    sidebarLogoBg: '#15233e',
    menuText: '#a0b0d8',
    menuActiveText: '#3d7fff',
    menuHoverBg: '#243570',
    submenuBg: '#13204a',
    headerBg: '#f8faff',
    headerText: '#1a2a5c',
    mainBg: '#f0f4ff',
    collapseHover: '#3d7fff',
    userHoverBg: '#e8f0ff'
  },

  // ========== 浅色侧栏主题 ==========

  // 极简纯白
  light: {
    name: '极简纯白',
    icon: 'Sunny',
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#ffffff',
    sidebarLogoBg: '#f5f7fa',
    menuText: '#606266',
    menuActiveText: '#409eff',
    menuHoverBg: '#ecf5ff',
    submenuBg: '#f5f7fa',
    headerBg: '#ffffff',
    headerText: '#303133',
    mainBg: '#f0f2f5',
    collapseHover: '#409eff',
    userHoverBg: '#f5f7fa'
  },
  // 樱花粉漾
  'sakura-pink': {
    name: '樱花粉漾',
    icon: 'Sunny',
    primary: '#f06292',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#fff5f8',
    sidebarLogoBg: '#fce8f0',
    menuText: '#8c5a6e',
    menuActiveText: '#f06292',
    menuHoverBg: '#fce0ec',
    submenuBg: '#fff0f5',
    headerBg: '#ffffff',
    headerText: '#5c2a3e',
    mainBg: '#fef8fb',
    collapseHover: '#f06292',
    userHoverBg: '#fce8f0'
  },
  // 薄荷清青
  'mint-fresh': {
    name: '薄荷清青',
    icon: 'Sunny',
    primary: '#26c6a6',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#f0faf8',
    sidebarLogoBg: '#e0f5f0',
    menuText: '#4a6a5e',
    menuActiveText: '#26c6a6',
    menuHoverBg: '#d5f0e8',
    submenuBg: '#ecfaf6',
    headerBg: '#ffffff',
    headerText: '#1a4a3e',
    mainBg: '#f5fdfa',
    collapseHover: '#26c6a6',
    userHoverBg: '#e8f8f4'
  },
  // 雾霭银灰
  'mist-gray': {
    name: '雾霭银灰',
    icon: 'Sunny',
    primary: '#6c8eef',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#f5f5f8',
    sidebarLogoBg: '#ececf0',
    menuText: '#5a5a66',
    menuActiveText: '#6c8eef',
    menuHoverBg: '#e8e8f0',
    submenuBg: '#f0f0f5',
    headerBg: '#ffffff',
    headerText: '#303036',
    mainBg: '#f4f4f8',
    collapseHover: '#6c8eef',
    userHoverBg: '#ececf2'
  },
  // 天空浅蓝
  'sky-blue': {
    name: '天空浅蓝',
    icon: 'Sunny',
    primary: '#42a5f5',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#f0f7ff',
    sidebarLogoBg: '#e0ecff',
    menuText: '#4a5a6e',
    menuActiveText: '#42a5f5',
    menuHoverBg: '#d8eaff',
    submenuBg: '#ecf5ff',
    headerBg: '#ffffff',
    headerText: '#1a3a5c',
    mainBg: '#f5faff',
    collapseHover: '#42a5f5',
    userHoverBg: '#e0ecff'
  },
  // 米杏奶咖
  'cream-latte': {
    name: '米杏奶咖',
    icon: 'Sunny',
    primary: '#c4853f',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#faf6f0',
    sidebarLogoBg: '#f0ebe0',
    menuText: '#6a5a40',
    menuActiveText: '#c4853f',
    menuHoverBg: '#f0e8d8',
    submenuBg: '#f5f0e8',
    headerBg: '#ffffff',
    headerText: '#4a3020',
    mainBg: '#fdfaf5',
    collapseHover: '#c4853f',
    userHoverBg: '#f0ece0'
  },
  // 葡萄淡紫
  'grape-lilac': {
    name: '葡萄淡紫',
    icon: 'Sunny',
    primary: '#ab7df0',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#f7f2fd',
    sidebarLogoBg: '#ece0f8',
    menuText: '#5a4a6e',
    menuActiveText: '#ab7df0',
    menuHoverBg: '#ebdafa',
    submenuBg: '#f3ecfa',
    headerBg: '#ffffff',
    headerText: '#3d2a5c',
    mainBg: '#fcf8ff',
    collapseHover: '#ab7df0',
    userHoverBg: '#ede0f8'
  },
  // 海风蔚蓝
  'sea-breeze': {
    name: '海风蔚蓝',
    icon: 'Sunny',
    primary: '#2bb6c8',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    sidebarBg: '#f0fafd',
    sidebarLogoBg: '#e0f0f5',
    menuText: '#3a5a64',
    menuActiveText: '#2bb6c8',
    menuHoverBg: '#d5f0f5',
    submenuBg: '#ecf8fa',
    headerBg: '#ffffff',
    headerText: '#1a4a54',
    mainBg: '#f5fdfe',
    collapseHover: '#2bb6c8',
    userHoverBg: '#e0f0f5'
  }
}

export const useThemeStore = defineStore('theme', () => {
  const themeKey = ref(localStorage.getItem('theme') || 'deep-blue')

  const theme = computed(() => THEMES[themeKey.value] || THEMES['deep-blue'])
  const themeList = Object.entries(THEMES).map(([key, val]) => ({
    key,
    name: val.name,
    icon: val.icon
  }))

  function setTheme(key) {
    if (!THEMES[key]) return
    themeKey.value = key
    localStorage.setItem('theme', key)
  }

  return { themeKey, theme, themeList, setTheme }
})
