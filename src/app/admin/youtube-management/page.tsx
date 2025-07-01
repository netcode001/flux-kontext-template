import YouTubeManagementContent from '@/components/admin/YouTubeManagementContent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube视频管理 | 管理后台',
  description: 'YouTube视频搜索、导入和管理功能'
}

export default function YouTubeManagementPage() {
  return <YouTubeManagementContent />
} 