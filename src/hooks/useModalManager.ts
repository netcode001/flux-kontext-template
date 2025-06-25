import { useState, useEffect, useCallback } from 'react'

// 简化的全局模态框状态管理
let currentOpenModalId: string | null = null
const modalCallbacks = new Map<string, () => void>()

export function useModalManager(modalId: string) {
  const [isOpen, setIsOpen] = useState(false)

  // 注册关闭回调
  useEffect(() => {
    modalCallbacks.set(modalId, () => setIsOpen(false))
    return () => {
      modalCallbacks.delete(modalId)
    }
  }, [modalId])

  // 打开模态框
  const openModal = useCallback(() => {
    console.log('🎪 尝试打开模态框:', modalId, '当前打开的:', currentOpenModalId)
    
    // 如果有其他模态框打开，先关闭它
    if (currentOpenModalId && currentOpenModalId !== modalId) {
      console.log('🔄 关闭其他模态框:', currentOpenModalId)
      const closeCallback = modalCallbacks.get(currentOpenModalId)
      if (closeCallback) {
        closeCallback()
      }
      // 恢复页面滚动
      document.documentElement.style.overflow = ''
    }
    
    // 打开当前模态框
    currentOpenModalId = modalId
    setIsOpen(true)
    
    // 锁定页面滚动
    document.documentElement.style.overflow = 'hidden'
    console.log('🔒 全局模态框管理 - 打开:', modalId)
  }, [modalId])

  // 关闭模态框
  const closeModal = useCallback(() => {
    console.log('🎪 尝试关闭模态框:', modalId, '当前打开的:', currentOpenModalId)
    
    if (currentOpenModalId === modalId) {
      currentOpenModalId = null
      setIsOpen(false)
      
      // 恢复页面滚动
      document.documentElement.style.overflow = ''
      console.log('🔓 全局模态框管理 - 关闭:', modalId)
    }
  }, [modalId])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (currentOpenModalId === modalId) {
        currentOpenModalId = null
        document.documentElement.style.overflow = ''
        console.log('🧹 组件卸载清理模态框:', modalId)
      }
    }
  }, [modalId])

  return {
    isOpen,
    openModal,
    closeModal,
    isActive: currentOpenModalId === modalId
  }
} 