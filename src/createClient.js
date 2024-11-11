import { createClient } from "@supabase/supabase-js";

const apiUrl = "https://wwxaqmnqcqdxbwtfwksn.supabase.co"
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3eGFxbW5xY3FkeGJ3dGZ3a3NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU3OTU2NiwiZXhwIjoyMDQ1MTU1NTY2fQ.Qv8gmCmHMeSq8Mg9P3yIZ2wLqyqWPSiTDc07PhNwtAY"

export const supabase = createClient(apiUrl, apiKey)