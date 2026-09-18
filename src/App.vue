<template>
  <router-view />
</template>

<script setup>
import { watchEffect } from 'vue'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

/**
 * 将 hex 颜色与白色混合,返回混合后的颜色。
 * 用于计算 Element Plus 的 light 变体系列。
 */
function mixWithWhite(hex, weight) {
  const rgb = hexToRgb(hex)
  const r = Math.round(rgb.r + (255 - rgb.r) * weight)
  const g = Math.round(rgb.g + (255 - rgb.g) * weight)
  const b = Math.round(rgb.b + (255 - rgb.b) * weight)
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * 将 hex 颜色与黑色混合,返回混合后的颜色。
 * 用于计算 Element Plus 的 dark 变体系列。
 */
function mixWithBlack(hex, weight) {
  const rgb = hexToRgb(hex)
  const r = Math.round(rgb.r * (1 - weight))
  const g = Math.round(rgb.g * (1 - weight))
  const b = Math.round(rgb.b * (1 - weight))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  }
}

/**
 * 根据主题注入 Element Plus 全局 CSS 变量。
 * 覆盖 --el-color-primary 及其 light/dark 衍生色,
 * 使所有 el-button、el-link、el-switch、el-tabs、el-pagination 等组件跟随主题色。
 */
function applyThemeVars(theme) {
  const root = document.documentElement
  const { primary, success, warning, danger } = theme

  const colorMap = {
    primary,
    success,
    warning,
    danger
  }

  Object.entries(colorMap).forEach(([type, base]) => {
    root.style.setProperty(`--el-color-${type}`, base)
    root.style.setProperty(`--el-color-${type}-light-3`, mixWithWhite(base, 0.3))
    root.style.setProperty(`--el-color-${type}-light-5`, mixWithWhite(base, 0.5))
    root.style.setProperty(`--el-color-${type}-light-7`, mixWithWhite(base, 0.7))
    root.style.setProperty(`--el-color-${type}-light-8`, mixWithWhite(base, 0.8))
    root.style.setProperty(`--el-color-${type}-light-9`, mixWithWhite(base, 0.9))
    root.style.setProperty(`--el-color-${type}-dark-2`, mixWithBlack(base, 0.2))
  })
}

// 响应式:主题变化时自动注入 CSS 变量
watchEffect(() => {
  applyThemeVars(themeStore.theme)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
</style>
