import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 后端 UserTokenVo 返回: accessToken / refreshToken / accessExpire
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const accessExpire = ref(Number(localStorage.getItem('accessExpire')) || 0)
  const userInfo = ref(null)

  function setToken(userToken) {
    // 兼容直接传入字符串或 UserTokenVo 对象
    if (typeof userToken === 'string') {
      token.value = userToken
      localStorage.setItem('token', userToken)
      return
    }
    const accessToken = userToken?.accessToken || ''
    token.value = accessToken
    refreshToken.value = userToken?.refreshToken || ''
    accessExpire.value = Number(userToken?.accessExpire) || 0
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken.value)
    localStorage.setItem('accessExpire', accessExpire.value)
  }

  function setUserInfo(info) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    accessExpire.value = 0
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('accessExpire')
  }

  return {
    token,
    refreshToken,
    accessExpire,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
})
