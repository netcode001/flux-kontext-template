import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      uuid: string
      email: string
      name?: string | null
      image?: string | null
      nickname: string
      avatar_url: string
      created_at: string
    }
  }

  interface User {
    id: string
    uuid?: string
    email: string
    name?: string | null
    image?: string | null
    nickname?: string
    avatar_url?: string
    created_at?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string
      uuid: string
      email: string
      name?: string | null
      image?: string | null
      nickname: string
      avatar_url: string
      created_at: string
    }
  }
} 