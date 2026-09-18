import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// 是否正在刷新 token
let isRefreshing = false
// 等待 token 刷新完成的请求队列
let pendingRequests = []

const request = axios.create({
  baseURL: '/api/admin/v1',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // token 即后端 UserTokenVo.accessToken,后端使用 x-token header 鉴权
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['x-token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 部分接口(如 login/auth)由 GlobalResponseAdvice 统一封装为 { code, msg, data }
    // 也存在直接返回原始对象的场景,这里统一兼容
    if (res === null || res === undefined) {
      return res
    }
    // 没有 code 字段说明不是统一返回结构,直接透传
    if (res.code === undefined) {
      return res
    }
    // 后端成功码为 1
    if (res.code !== 1) {
      // 200101: 登录失效
      if (res.code === 200101) {
        // 刷新 token 接口本身失效则直接跳登录,避免递归
        if (response.config._isRefreshToken) {
          handleLogout()
          return Promise.reject(new Error('登录失效,请重新登录'))
        }
        return handleTokenExpired(response.config)
      }
      // 200103: 账号被冻结,直接登出
      if (res.code === 200103) {
        ElMessage.error(res.msg || '您的账号被冻结,请联系客服')
        handleLogout()
        return Promise.reject(new Error(res.msg || '账号被冻结'))
      }
      // 200199: 无权限,提示但不登出
      if (res.code === 200199) {
        ElMessage.error(res.msg || '您暂无此操作权限,请联系客服')
        return Promise.reject(new Error(res.msg || '无权限'))
      }
      // 兼容 HTTP 401
      if (res.code === 401) {
        return handleTokenExpired(response.config)
      }
      ElMessage.error(res.msg || res.message || '请求失败')
      return Promise.reject(new Error(res.msg || res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    console.error('API 错误:', error.config?.url, error.message)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// token 失效处理:用 refreshToken 刷新,成功则重放原请求,失败则登出
function handleTokenExpired(originalConfig) {
  const userStore = useUserStore()
  const refreshToken = userStore.refreshToken

  // 无 refreshToken 直接登出
  if (!refreshToken) {
    ElMessage.error('登录失效,请重新登录')
    handleLogout()
    return Promise.reject(new Error('登录失效,请重新登录'))
  }

  // 已有刷新请求进行中,当前请求入队等待刷新结果
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ originalConfig, resolve, reject })
    })
  }

  isRefreshing = true
  return request
    .post('/security/refreshAccessToken', { refreshToken }, { _isRefreshToken: true })
    .then((res) => {
      // 响应拦截器已返回 { code, msg, data },data 为 UserTokenVo
      const userToken = res?.data
      if (!userToken || !userToken.accessToken) {
        throw new Error('刷新 token 失败')
      }
      userStore.setToken(userToken)

      // 重放原请求
      if (originalConfig) {
        originalConfig.headers['x-token'] = userToken.accessToken
      }
      // 重放入队请求 + 原请求
      pendingRequests.forEach(({ originalConfig: cfg, resolve, reject }) => {
        if (cfg) {
          cfg.headers['x-token'] = userToken.accessToken
        }
        request.request(cfg).then(resolve).catch(reject)
      })
      pendingRequests = []

      return originalConfig ? request.request(originalConfig) : res
    })
    .catch((error) => {
      // 刷新失败,拒绝所有排队请求并登出
      pendingRequests.forEach(({ reject }) => reject(error))
      pendingRequests = []
      ElMessage.error('登录失效,请重新登录')
      handleLogout()
      return Promise.reject(error)
    })
    .finally(() => {
      isRefreshing = false
    })
}

// 统一登出处理
function handleLogout() {
  const userStore = useUserStore()
  userStore.logout()
  // 使用 window.location 确保强制跳转并清空状态
  window.location.href = '/login'
}

export default request
