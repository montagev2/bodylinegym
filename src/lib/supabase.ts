import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://penzktygcpvymfsyslew.supabase.co'
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_3olaTzF0zwMpxoIqiQ1D8A_U-SMOqVj'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-blfc-client': 'web-v1.0',
    },
  },
})

// Warmup ping on startup
if (typeof window !== 'undefined') {
  let lastPingAt = 0
  const PING_INTERVAL_MS = 20 * 60 * 1000

  const ping = () => {
    const now = Date.now()
    if (now - lastPingAt < PING_INTERVAL_MS) return
    lastPingAt = now
    void (async () => {
      try {
        await supabase.from('gym_plans').select('id').limit(1)
      } catch {
        // silent
      }
    })()
  }

  ping()
  window.addEventListener('focus', ping)
}
