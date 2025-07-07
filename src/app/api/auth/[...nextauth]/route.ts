import NextAuth from "next-auth"
// 🚨 临时使用简化配置测试 Google OAuth
import { authOptionsSimple } from "@/lib/auth-simple"

const handler = NextAuth(authOptionsSimple)

export { handler as GET, handler as POST } 