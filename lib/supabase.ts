import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export type Prompt = { id: number; title: string; description: string; content: string; level: 'Iniciante' | 'Intermediário' | 'Avançado'; tags: string[]; link?: string; created_at: string }
export type Video = { id: number; title: string; description: string; url: string; level: 'Iniciante' | 'Intermediário' | 'Avançado'; channel: string; duration_minutes: number; tags: string[] }
export type Course = { id: number; title: string; description: string; url: string; level: 'Iniciante' | 'Intermediário' | 'Avançado'; provider: string; duration_hours: number; tags: string[] }
export type Recommendation = { id: number; title: string; description: string; content: string; category: string; level: 'Iniciante' | 'Intermediário' | 'Avançado'; tags: string[] }