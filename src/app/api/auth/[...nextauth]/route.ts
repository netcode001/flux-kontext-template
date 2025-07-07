import NextAuth from "next-auth"
// ✅ 恢复完整的 NextAuth 配置，配合新的 Google OAuth 凭据
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 