import request from '@/utils/request'

// 登录 (AdminLoginRequest: { loginName, password })
export function login(data) {
  return request({
    url: '/security/login',
    method: 'post',
    data
  })
}

// 登出 (LogoutRequest: { refreshToken })
export function logout(data) {
  return request({
    url: '/security/logout',
    method: 'post',
    data
  })
}

// 获取当前登录账号信息 (KiteAccount)
export function getAuthInfo() {
  return request({
    url: '/security/auth',
    method: 'get'
  })
}

// 刷新 accessToken (RefreshAccessTokenRequest: { refreshToken })
export function refreshAccessToken(data) {
  return request({
    url: '/security/refreshAccessToken',
    method: 'post',
    data
  })
}
