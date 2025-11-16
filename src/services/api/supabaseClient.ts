import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get the variables from the extra config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in app config");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined, // We'll use Expo SecureStore later
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
