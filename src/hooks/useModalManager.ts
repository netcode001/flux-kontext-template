import { useState, useEffect, useCallback } from 'react'

// 全局模态框状态管理
let globalModalId: string | null = null
let setGlobalModalId: ((id: string | null) => void) | null = null

export function useModalManager(modalId: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [globalState, setGlobalState] = useState<string | null>(null)

  // 初始化全局状态管理
  useEffect(() => {
    if (!setGlobalModalId) {
      setGlobalModalId = setGlobalState
    }
  }, [])

  // 监听全局模态框状态变化
  useEffect(() => {
    if (globalState !== globalModalId) {
      globalModalId = globalState
      // 如果全局模态框ID不是当前模态框，则关闭当前模态框
      if (globalModalId !== modalId && isOpen) {
        setIsOpen(false)
      }
    }
  }, [globalState, modalId, isOpen])

  // 打开模态框
  const openModal = useCallback(() => {
    // 关闭其他所有模态框
    if (setGlobalModalId) {
      setGlobalModalId(modalId)
    }
    globalModalId = modalId
    setIsOpen(true)
    
    // 锁定页面滚动
    document.documentElement.style.overflow = 'hidden'
    console.log('🔒 全局模态框管理 - 打开:', modalId)
  }, [modalId])

  // 关闭模态框
  const closeModal = useCallback(() => {
    if (setGlobalModalId && globalModalId === modalId) {
      setGlobalModalId(null)
    }
    globalModalId = null
    setIsOpen(false)
    
    // 恢复页面滚动
    document.documentElement.style.overflow = ''
    console.log('🔓 全局模态框管理 - 关闭:', modalId)
  }, [modalId])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (globalModalId === modalId) {
        closeModal()
      }
    }
  }, [modalId, closeModal])

  return {
    isOpen,
    openModal,
    closeModal,
    isActive: globalModalId === modalId
  }
} 