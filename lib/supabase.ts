import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Prompt = {
  id: number
  title: string
  description: string
  content: string
  level: string
  tags: string[]
  created_at: string
}

export type Video = {
  id: number
  title: string
  description: string
  url: string
  level: string
  tags: string[]
  created_at: string
}

export type Course = {
  id: number
  title: string
  description: string
  url: string
  level: string
  tags: string[]
  created_at: string
}

export type Recommendation = {
  id: number
  title: string
  description: string
  url: string
  level: string
  tags: string[]
  created_at: string
}
