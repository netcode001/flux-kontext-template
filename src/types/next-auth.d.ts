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
      credits?: number | null
      tier?: string | null
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
    credits?: number | null
    tier?: string | null
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