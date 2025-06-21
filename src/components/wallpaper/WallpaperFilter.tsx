'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { WallpaperFilterProps } from '@/types/wallpaper'

export function WallpaperFilter({
  categories,
  selectedCategory,
  selectedTags,
  sortBy,
  onCategoryChange,
  onTagsChange,
  onSortChange,
  onSearch
}: WallpaperFilterProps) {
  
  const sortOptions = [
    { value: 'latest', label: '最新发布' },
    { value: 'popular', label: '最受欢迎' },
    { value: 'downloads', label: '下载最多' },
    { value: 'likes', label: '点赞最多' }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* 分类筛选 */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">分类</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange('')}
              >
                全部
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 排序选项 */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">排序方式</h3>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSortChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 已选标签 */}
          {selectedTags && selectedTags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">已选标签</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                    onClick={() => {
                      const newTags = selectedTags.filter(t => t !== tag)
                      onTagsChange(newTags)
                    }}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 