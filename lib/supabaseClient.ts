import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://elthavgpchuxrqmpmpjq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdGhhdmdwY2h1eHJxbXBtcGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYwMTQ3OTUsImV4cCI6MjAzMTU5MDc5NX0.L78Jlpd4sVxbn1p0sY7zBEpbEZgsaadlMPZhzmpqX0M'
export const supabase = createClient(supabaseUrl, supabaseKey)