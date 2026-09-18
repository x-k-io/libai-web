// 环境配置工具

export const ENV = {
  // 应用标题
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'LibAI管理系统',
  
  // 当前环境
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // API基础URL
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:11010',
  
  // 判断是否为开发环境（使用 includes 兼容各种情况）
  isDevelopment: String(import.meta.env.VITE_APP_ENV).includes('development'),
  
  // 判断是否为测试环境
  isTest: String(import.meta.env.VITE_APP_ENV).includes('test'),
  
  // 判断是否为生产环境
  isProduction: String(import.meta.env.VITE_APP_ENV).includes('production')
}

// 打印环境信息（仅开发环境）
console.log('[ENV] 环境配置模块已加载')
console.log('[ENV] import.meta.env.VITE_APP_ENV =', import.meta.env.VITE_APP_ENV)
console.log('[ENV] ENV.APP_ENV =', ENV.APP_ENV)
console.log('[ENV] typeof ENV.APP_ENV =', typeof ENV.APP_ENV)
console.log('[ENV] ENV.isDevelopment =', ENV.isDevelopment)

if (ENV.isDevelopment) {
  console.log('=== 环境配置 ===')
  console.log('环境:', ENV.APP_ENV)
  console.log('API地址:', ENV.API_BASE_URL)
  console.log('================')
} else {
  console.log('[ENV] 当前环境:', ENV.APP_ENV, '(非开发环境，不打印详细配置)')
}
