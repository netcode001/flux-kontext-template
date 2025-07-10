import { SignIn } from '@clerk/nextjs';

// 自定义登录页，自动支持邮箱验证码、邮箱密码、社交登录等所有已启用方式
export default function Page() {
  return <SignIn />;
} 