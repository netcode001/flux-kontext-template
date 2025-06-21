"use client"

// 🎛️ 菜单管理界面组件
// 管理网站header菜单的显示、隐藏、排序和配置

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Save, 
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react'

// 📋 菜单项类型定义
interface MenuItem {
  id: string
  key: string
  label: string
  href: string
  emoji?: string
  icon?: string
  sort_order: number
  is_visible: boolean
  is_dropdown: boolean
  parent_id?: string | null
  target?: string
  css_class?: string
  permission_required?: string
  children?: MenuItem[]
}

interface MenuFormData {
  key: string
  label: string
  href: string
  emoji: string
  sort_order: number
  is_visible: boolean
  is_dropdown: boolean
  parent_id: string | null
  target: string
  css_class: string
  permission_required: string
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 📊 初始表单数据
  const initialFormData: MenuFormData = {
    key: '',
    label: '',
    href: '',
    emoji: '',
    sort_order: 0,
    is_visible: true,
    is_dropdown: false,
    parent_id: null,
    target: '_self',
    css_class: '',
    permission_required: ''
  }

  const [formData, setFormData] = useState<MenuFormData>(initialFormData)

  // 🔄 加载菜单数据
  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/menu-items')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取菜单数据失败')
      }

      setMenuItems(result.data.menuItems || [])
      setError(null)
    } catch (err: any) {
      console.error('❌ 加载菜单数据失败:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMenuItems()
  }, [])

  // 👁️ 切换可见性
  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/menu-items/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_visibility',
          items: [{
            id,
            is_visible: !currentVisibility
          }]
        })
      })

      if (!response.ok) {
        throw new Error('可见性更新失败')
      }

      // 更新本地状态
      setMenuItems(items => items.map(item => 
        item.id === id ? { ...item, is_visible: !currentVisibility } : item
      ))

      setSuccess('菜单可见性更新成功！')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('❌ 可见性更新失败:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ✏️ 开始编辑
  const startEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      key: item.key,
      label: item.label,
      href: item.href,
      emoji: item.emoji || '',
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      is_dropdown: item.is_dropdown,
      parent_id: item.parent_id || null,
      target: item.target || '_self',
      css_class: item.css_class || '',
      permission_required: item.permission_required || ''
    })
    setShowAddForm(false)
  }

  // ➕ 开始添加
  const startAdd = () => {
    setShowAddForm(true)
    setEditingItem(null)
    setFormData({
      ...initialFormData,
      sort_order: menuItems.length + 1
    })
  }

  // 💾 保存菜单项
  const saveMenuItem = async () => {
    try {
      setSaving(true)
      
      const url = '/api/admin/menu-items'
      const method = editingItem ? 'PUT' : 'POST'
      
      const requestData = editingItem 
        ? { ...formData, id: editingItem.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '保存失败')
      }

      setSuccess(result.message || '菜单项保存成功！')
      setTimeout(() => setSuccess(null), 3000)
      
      // 重新加载数据
      await loadMenuItems()
      
      // 关闭表单
      setEditingItem(null)
      setShowAddForm(false)
      setFormData(initialFormData)
      
    } catch (err: any) {
      console.error('❌ 保存菜单项失败:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 🗑️ 删除菜单项
  const deleteMenuItem = async (id: string, label: string) => {
    if (!confirm(`确定要删除菜单项 "${label}" 吗？`)) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/menu-items?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '删除失败')
      }

      setSuccess(result.message || '菜单项删除成功！')
      setTimeout(() => setSuccess(null), 3000)
      
      // 重新加载数据
      await loadMenuItems()
      
    } catch (err: any) {
      console.error('❌ 删除菜单项失败:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 🔄 切换展开状态
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // 📱 渲染菜单项
  const renderMenuItem = (item: MenuItem, isChild = false) => (
    <div
      key={item.id}
      className={`bg-white rounded-lg border p-4 mb-3 shadow-sm ${
        isChild ? 'ml-8 border-l-4 border-l-primary/30' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* 展开/收起按钮（有子菜单时显示） */}
          {item.children && item.children.length > 0 && (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedItems.has(item.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* 菜单信息 */}
          <div className="flex items-center space-x-3 flex-1">
            {item.emoji && (
              <span className="text-lg">{item.emoji}</span>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-black text-base">{item.label || '未命名菜单'}</span>
                <Badge variant={item.is_dropdown ? "secondary" : "outline"} className="text-xs">
                  {item.is_dropdown ? '下拉菜单' : '普通链接'}
                </Badge>
                {item.permission_required && (
                  <Badge variant="destructive" className="text-xs">
                    {item.permission_required}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">Key: {item.key}</span>
                <span>•</span>
                <span className="text-blue-600">{item.href}</span>
                {item.target === '_blank' && (
                  <ExternalLink className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleVisibility(item.id, item.is_visible)}
            className={`p-2 rounded-md transition-colors ${
              item.is_visible 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            disabled={saving}
            title={item.is_visible ? '隐藏菜单' : '显示菜单'}
          >
            {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => startEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="编辑菜单"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => deleteMenuItem(item.id, item.label)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            disabled={saving}
            title="删除菜单"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 子菜单 */}
      {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
        <div className="mt-4 space-y-2">
          {item.children.map((child) => renderMenuItem(child, true))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">加载菜单数据中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">菜单管理</h2>
          <p className="text-gray-600 mt-1">管理网站头部导航菜单的显示和排序</p>
        </div>
        <Button onClick={startAdd} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>添加菜单</span>
        </Button>
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          ✅ {success}
        </div>
      )}

      {/* 菜单列表 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">当前菜单项 ({menuItems.length})</h3>
        
        {menuItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暂无菜单项</p>
            <p className="text-sm mt-1">点击上方"添加菜单"按钮创建第一个菜单项</p>
          </div>
        ) : (
          <div className="space-y-3">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        )}
      </Card>

      {/* 添加/编辑表单 */}
      {(showAddForm || editingItem) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? '编辑菜单项' : '添加菜单项'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingItem(null)
                setFormData(initialFormData)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">菜单Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="如: home, generate"
                />
                <p className="text-xs text-gray-500 mt-1">唯一标识符，用于程序识别</p>
              </div>

              <div>
                <Label htmlFor="label">显示名称 *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="如: 首页, 生成图片"
                />
              </div>

              <div>
                <Label htmlFor="href">链接地址 *</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                  placeholder="如: /, /generate"
                />
              </div>

              <div>
                <Label htmlFor="emoji">图标Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="如: 🏠, ✨"
                />
              </div>
            </div>

            {/* 高级设置 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="sort_order">排序位置</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="parent_id">父菜单</Label>
                <select
                  id="parent_id"
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value || null }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">无（顶级菜单）</option>
                  {menuItems.filter(item => item.is_dropdown).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="target">链接目标</Label>
                <select
                  id="target"
                  value={formData.target}
                  onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="_self">当前窗口</option>
                  <option value="_blank">新窗口</option>
                </select>
              </div>

              <div>
                <Label htmlFor="permission_required">权限要求</Label>
                <Input
                  id="permission_required"
                  value={formData.permission_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, permission_required: e.target.value }))}
                  placeholder="如: admin, premium"
                />
              </div>

              {/* 布尔选项 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_visible"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_visible">显示菜单</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_dropdown"
                    checked={formData.is_dropdown}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_dropdown: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_dropdown">下拉菜单</Label>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setEditingItem(null)
                setFormData(initialFormData)
              }}
            >
              取消
            </Button>
            <Button
              onClick={saveMenuItem}
              disabled={saving || !formData.key || !formData.label || !formData.href}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{editingItem ? '更新' : '创建'}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
} 