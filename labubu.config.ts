export const labubu = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  name: "Labubu梦想社区",
  title: "Labubu梦想社区 | 全球首个Labubu主题垂直社区", 
  description: "Labubu收藏爱好者的专属社区，AI图像生成、资讯聚合、用户原创分享",
  
  // Labubu主题色彩方案
  theme: {
    primaryColor: "#FF6B9D", // Labubu粉色
    secondaryColor: "#FFB6C1", // 浅粉色  
    accentColor: "#9C27B0", // 紫色
    backgroundColor: "#FFF0F5", // 薰衣草粉
    textColor: "#2D1B69", // 深紫色文字
  },
  
  // 功能模块配置
  features: {
    aiGeneration: true, // AI图像生成
    newsAggregation: true, // 资讯聚合
    userGallery: true, // 用户秀场  
    hotTopics: true, // 全网热搜
    newsletter: true, // 邮件订阅
    adminPanel: true, // 管理面板
  },
  
  // 内容分类
  categories: [
    {
      id: "news",
      name: "Labubu快报",
      description: "最新资讯和活动信息",
      icon: "📰",
      color: "#FF6B9D"
    },
    {
      id: "gallery", 
      name: "创意秀场",
      description: "用户原创作品展示",
      icon: "🎨", 
      color: "#FFB6C1"
    },
    {
      id: "collection",
      name: "收藏指南", 
      description: "收藏技巧和经验分享",
      icon: "💎",
      color: "#9C27B0"
    },
    {
      id: "tutorial",
      name: "玩法教程",
      description: "Labubu相关教程和攻略", 
      icon: "📚",
      color: "#DA70D6"
    }
  ],
  
  // 社区规则
  community: {
    maxImageSize: "5MB",
    allowedFileTypes: ["jpg", "jpeg", "png", "gif", "webp"],
    maxPostLength: 2000,
    moderationEnabled: true,
  }
};

// 类型定义
export type LabubuConfig = typeof labubu;
export type LabubuCategory = typeof labubu.categories[0]; 