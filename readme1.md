# 项目更新日志

## 2024-07-28

- **功能**: 更新 Labubu 作品画廊页面 (`/labubu-gallery`)
- **详情**:
  - **布局**: 将瀑布流布局调整为在桌面端（md breakpoint及以上）默认显示五列，以优化视觉效果。
  - **UI简化**: 移除了网格/列表视图切换按钮，固定为瀑布流网格视图，简化了用户操作界面。
- **文件**: `src/components/labubu/LabubuGalleryContent.tsx`

---

### 2024-07-28 (修正)

- **功能**: 优化 Labubu 作品画廊页面的搜索栏样式
- **详情**:
  - **布局**: 移除了搜索框的最大宽度限制，使其能够自动拉伸并填满左侧的可用空间，提升了大屏幕下的使用体验。
- **文件**: `src/components/labubu/LabubuGalleryContent.tsx` 