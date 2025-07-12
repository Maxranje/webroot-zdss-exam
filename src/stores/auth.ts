import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import type { LoginParams, UserInfo, LoginResponse, ApiResponse } from '@/types/auth'
import { createAuthenticatedFetch, handleApiResponse, storage } from '@/utils/http'

const STORAGE_KEYS = {
  TOKEN: 'auth-token',
  USER_INFO: 'user-info',
  IS_LOGGED_IN: 'is-logged-in'
} as const

const VALIDATE_INTERVAL = 5 * 60 * 1000 // 5分钟缓存时间

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const isLoggedIn = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const lastValidateTime = ref(0)

  // 计算属性
  const hasToken = computed(() => !!token.value)

  // 处理认证失败的函数
  const handleUnauthorized = () => {
    logout()
  }

  // 创建带认证的 fetch 实例
  const authenticatedFetch = createAuthenticatedFetch(
    () => token.value,
    handleUnauthorized
  )

  // 初始化认证状态（从localStorage恢复）
  const initAuth = () => {
    const storedToken = storage.get<string>(STORAGE_KEYS.TOKEN)
    const storedUserInfo = storage.get<UserInfo>(STORAGE_KEYS.USER_INFO)
    const storedIsLoggedIn = storage.get<string>(STORAGE_KEYS.IS_LOGGED_IN)
    
    if (storedToken && storedUserInfo && storedIsLoggedIn === 'true') {
      token.value = storedToken
      userInfo.value = storedUserInfo
      isLoggedIn.value = true
    }
  }

  // 保存认证状态到localStorage
  const saveAuthState = (authToken: string, user: UserInfo) => {
    token.value = authToken
    userInfo.value = user
    isLoggedIn.value = true
    lastValidateTime.value = 0 // 重置验证缓存

    storage.set(STORAGE_KEYS.TOKEN, authToken)
    storage.set(STORAGE_KEYS.USER_INFO, user)
    storage.set(STORAGE_KEYS.IS_LOGGED_IN, 'true')
  }

  // 清除认证状态
  const clearAuthState = () => {
    isLoggedIn.value = false
    userInfo.value = null
    token.value = null
    lastValidateTime.value = 0

    storage.remove(STORAGE_KEYS.TOKEN)
    storage.remove(STORAGE_KEYS.USER_INFO)
    storage.remove(STORAGE_KEYS.IS_LOGGED_IN)
  }

  // 登录
  const login = async (params: LoginParams): Promise<{ success: boolean; message?: string }> => {
    loading.value = true
    
    try {
      const response = await fetch('/napi/sign/in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
      })

      const result: LoginResponse = await handleApiResponse(response)

      if (result.status === 0) {
        saveAuthState(result.data.auth_token, result.data.user)
        return { success: true }
      } else {
        return { success: false, message: result.msg || '登录失败' }
      }
    } catch (error) {
      console.error('登录请求失败:', error)
      return { success: false, message: error instanceof Error ? error.message : '网络错误，请重试' }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async (router?: Router) => {
    const currentToken = token.value
    
    // 先清除本地状态
    clearAuthState()
    
    // 调用登出接口清除服务端session
    if (currentToken) {
      try {
        await fetch('/napi/sign/out', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
      } catch (error) {
        console.error('登出接口调用失败:', error)
      }
    }

    // 跳转到登录页
    if (router) {
      router.push('/login')
    }
  }

  // 检查认证状态
  const checkAuthStatus = async (): Promise<boolean> => {
    const storedIsLoggedIn = storage.get<string>(STORAGE_KEYS.IS_LOGGED_IN)
    const storedToken = storage.get<string>(STORAGE_KEYS.TOKEN)
    const storedUserInfo = storage.get<UserInfo>(STORAGE_KEYS.USER_INFO)
    
    if (storedIsLoggedIn === 'true' && storedToken && storedUserInfo) {
      try {
        isLoggedIn.value = true
        token.value = storedToken
        userInfo.value = storedUserInfo
        return true
      } catch (e) {
        console.error('恢复认证状态失败:', e)
        clearAuthState()
        return false
      }
    }
    
    return false
  }

  // 检查是否需要验证token（基于缓存时间）
  const shouldValidateToken = (): boolean => {
    const now = Date.now()
    return now - lastValidateTime.value > VALIDATE_INTERVAL
  }

  // 验证 token 有效性（带缓存机制）
  const validateToken = async (forceValidate: boolean = false): Promise<boolean> => {
    if (!token.value) return false
    
    // 如果不是强制验证且还在缓存期内，直接返回true
    if (!forceValidate && !shouldValidateToken()) {
      return true
    }
    
    try {
      const response = await authenticatedFetch('/napi/user/info', {
        method: 'GET',
      })
      
      if (response.ok) {
        lastValidateTime.value = Date.now()
        return true
      } else {
        lastValidateTime.value = 0
        return false
      }
    } catch (error) {
      console.error('Token 验证失败:', error)
      lastValidateTime.value = 0
      return false
    }
  }

  // 重置密码
  const resetPassword = async (params: { username: string; oldPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/napi/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
      })

      const result: ApiResponse = await handleApiResponse(response)

      if (result.status === 0) {
        return { success: true }
      } else {
        return { success: false, message: result.msg || '密码修改失败' }
      }
    } catch (error) {
      console.error('修改密码请求失败:', error)
      return { success: false, message: error instanceof Error ? error.message : '网络错误，请重试' }
    }
  }

  return {
    // 状态
    isLoggedIn,
    userInfo,
    token,
    loading,
    hasToken,
    lastValidateTime,
    
    // 方法
    initAuth,
    login,
    logout,
    checkAuthStatus,
    shouldValidateToken,
    validateToken,
    resetPassword,
    authenticatedFetch
  }
}) 