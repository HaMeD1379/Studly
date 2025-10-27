import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL! ?? "mock-url";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY! ?? "mock-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);