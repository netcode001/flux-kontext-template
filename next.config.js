/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🌐 Cloudflare Pages 部署配置
  // 注意：不使用 output: 'export' 因为我们需要支持 API 路由
  // Cloudflare Pages 原生支持 Next.js 的 API 路由，无需静态导出
  trailingSlash: false,
  
  // 开发环境跨域配置 - 支持局域网访问
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '0.0.0.0:3000',
    // 支持常见的局域网IP段
    '192.168.1.*:3000',
    '192.168.0.*:3000', 
    '192.168.101.*:3000',
    '10.0.0.*:3000',
    '172.16.*.*:3000',
    // 具体IP
    '192.168.101.5:3000'
  ],
  
  // 🔄 重定向配置
  async redirects() {
    return [
      // 临时重定向 - 用户登录后跳转 (307)
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: false, // 307 Temporary Redirect
      },
      {
        source: '/register',
        destination: '/auth/signup', 
        permanent: false, // 307 Temporary Redirect
      },
      // 永久重定向 - 页面结构调整 (301)
      {
        source: '/old-pricing',
        destination: '/pricing',
        permanent: true, // 301 Moved Permanently
      },
      {
        source: '/old-generate',
        destination: '/generate',
        permanent: true, // 301 Moved Permanently
      },
      // API版本重定向 (301)
      {
        source: '/api/v0/:path*',
        destination: '/api/v1/:path*',
        permanent: true, // 301 Moved Permanently
      },
    ]
  },
  
  // 图片配置 - 动态读取环境变量
  images: {
    remotePatterns: [
      // 第三方图片服务
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      // Google 头像服务
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
      // GitHub 头像服务
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      // FAL.ai 图片服务
      {
        protocol: "https",
        hostname: "fal.media",
        pathname: "/**",
      },
      // R2存储域名模式 - 支持所有R2存储子域名
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      // 动态添加环境变量中配置的R2域名
      ...(process.env.R2_PUBLIC_URL ? [{
        protocol: "https",
        hostname: process.env.R2_PUBLIC_URL.replace('https://', ''),
        pathname: "/**",
      }] : []),
      // 动态添加演示视频URL域名
      ...(process.env.NEXT_PUBLIC_DEMO_VIDEOS_URL ? [{
        protocol: "https", 
        hostname: process.env.NEXT_PUBLIC_DEMO_VIDEOS_URL.replace('https://', ''),
        pathname: "/**",
      }] : []),
    ],
    // 图片优化配置
    minimumCacheTTL: 60,
  },
  
  // 压缩配置
  compress: true,
  
  // 🔧 Cloudflare Pages 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

// 本地开发时初始化 OpenNext Cloudflare 适配 (生产环境不执行)
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  } catch (err) {
    // ⚠️ 本地缺少依赖时忽略，避免阻塞开发
    console.warn('OpenNext Cloudflare dev 初始化失败：', err?.message);
  }
}
