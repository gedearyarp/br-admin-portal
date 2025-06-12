import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  PORT: z.string().default("3000").transform((val) => parseInt(val, 10)),
})

// Function to validate environment variables
export function validateEnv() {
  try {
    const parsed = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      PORT: process.env.PORT,
    })
    return { success: true, data: parsed }
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

// Export validated environment variables
const env = validateEnv()

export const config = {
  supabase: {
    url: env.data.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  server: {
    port: env.data.PORT,
  },
} as const 