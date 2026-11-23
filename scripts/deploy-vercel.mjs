// Deploy script for Body Line Fitness Center gym website
// Usage: node scripts/deploy-vercel.mjs
// Requires VERCEL_TOKEN env variable

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// Set VERCEL_TOKEN in your environment before running this script
// e.g. $env:VERCEL_TOKEN = "vcp_..." (PowerShell) or export VERCEL_TOKEN="vcp_..." (bash)
const TOKEN = process.env.VERCEL_TOKEN
if (!TOKEN) {
  console.error('ERROR: VERCEL_TOKEN environment variable is required.')
  console.error('Run: $env:VERCEL_TOKEN = "your_token_here"')
  process.exit(1)
}
const PROJECT_NAME = 'bodylinegym'
const BUILD_DIR = 'dist'

const SUPABASE_URL = 'https://penzktygcpvymfsyslew.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_3olaTzF0zwMpxoIqiQ1D8A_U-SMOqVj'

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`)
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts })
    if (out) console.log(out)
    return out
  } catch (err) {
    const stderr = err.stderr?.toString() || ''
    const stdout = err.stdout?.toString() || ''
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    throw err
  }
}

async function deploy() {
  console.log('\n========================================')
  console.log('  BODY LINE FITNESS CENTER - Deploying')
  console.log('========================================\n')

  // 1. Build
  console.log('[1/4] Building...')
  run('npx tsc -b', { cwd: process.cwd() })
  run('npx vite build', { cwd: process.cwd() })
  console.log('[1/4] Build complete.')

  // 2. Set env vars
  console.log('\n[2/4] Setting environment variables...')
  const envArgs = `--token ${TOKEN}`
  const envVars = [
    ['VITE_SUPABASE_URL', SUPABASE_URL],
    ['VITE_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
  ]
  for (const [key, val] of envVars) {
    try {
      run(`echo "${val}" | npx vercel env add ${key} production ${envArgs} --yes 2>&1 || true`)
    } catch {
      // May already exist — that's fine
    }
  }

  // 3. Deploy to preview
  console.log('\n[3/4] Deploying to Vercel...')
  const previewUrl = run(
    `npx vercel deploy --prebuilt --token ${TOKEN} --name ${PROJECT_NAME} --yes 2>&1`
  ).trim().split('\n').filter(l => l.startsWith('https://')).pop()

  if (previewUrl) {
    console.log(`\nPreview URL: ${previewUrl}`)
  }

  // 4. Promote to production
  console.log('\n[4/4] Promoting to production...')
  if (previewUrl) {
    run(`npx vercel promote ${previewUrl} --token ${TOKEN} --yes 2>&1`)
    console.log('\n========================================')
    console.log(`  DEPLOYED: ${previewUrl}`)
    console.log('========================================\n')
  } else {
    console.log('Warning: could not determine preview URL for promotion.')
  }
}

deploy().catch(err => {
  console.error('\nDeploy failed:', err.message)
  process.exit(1)
})
