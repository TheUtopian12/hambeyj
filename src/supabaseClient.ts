import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://zbhnitpeouhrptoudujz.supabase.co').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xLpFT8iikIGoc4wfG7slAg_N4PMoA3X').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
