import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rellimqxrmfqruncvuvb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbGxpbXF4cm1mcXJ1bmN2dXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzQ1NTUsImV4cCI6MjA3MjIxMDU1NX0.U8G-4H0uXmVQFjh5Hvftz19WYcI5_E3kF7DtvzQcQRk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

