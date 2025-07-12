import { reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import type { LoginParams, ResetPasswordParams } from '@/types/auth'

// 登录表单composable
export const useLoginForm = () => {
  const loginFormRef = ref<FormInstance>()
  const loginForm = reactive<LoginParams>({
    username: '',
    password: '',
  })

  const loginRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }

  const validateLoginForm = async (): Promise<boolean> => {
    if (!loginFormRef.value) return false
    
    try {
      await loginFormRef.value.validate()
      return true
    } catch {
      return false
    }
  }

  const resetLoginForm = () => {
    loginForm.username = ''
    loginForm.password = ''
    loginFormRef.value?.clearValidate()
  }

  return {
    loginFormRef,
    loginForm,
    loginRules,
    validateLoginForm,
    resetLoginForm,
  }
}

// 重置密码表单composable
export const useResetPasswordForm = () => {
  const resetFormRef = ref<FormInstance>()
  const resetForm = reactive<ResetPasswordParams>({
    username: '',
    oldPassword: '',
    newPassword: '',
  })

  const resetRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '新密码长度至少6位', trigger: 'blur' },
    ],
  }

  const validateResetForm = async (): Promise<boolean> => {
    if (!resetFormRef.value) return false
    
    try {
      await resetFormRef.value.validate()
      return true
    } catch {
      return false
    }
  }

  const resetResetForm = () => {
    resetForm.username = ''
    resetForm.oldPassword = ''
    resetForm.newPassword = ''
    resetFormRef.value?.clearValidate()
  }

  return {
    resetFormRef,
    resetForm,
    resetRules,
    validateResetForm,
    resetResetForm,
  }
} 