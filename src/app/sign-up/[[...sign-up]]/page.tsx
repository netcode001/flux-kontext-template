import { SignUp } from '@clerk/nextjs';

// 自定义注册页，自动支持邮箱、社交等所有已启用方式
export default function Page() {
  return <SignUp />;
} 