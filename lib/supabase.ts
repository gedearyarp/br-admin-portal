import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

// Create a single supabase client for the entire app
// This ensures we don't create multiple connections
export const supabase = createClient(config.supabase.url, config.supabase.anonKey)
