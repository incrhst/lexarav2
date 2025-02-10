import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../.env')

dotenv.config({ path: envPath })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
})

async function runMigration() {
  try {
    console.log('Starting database migration...')

    // Read the SQL file
    const sqlPath = join(__dirname, 'setup_database.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    // Execute the SQL directly
    const { error } = await supabase.sql(sql)
    if (error) throw error

    console.log('Database migration completed successfully')
    console.log('Now running the admin user setup...')

    // Run the admin setup script
    const { default: setupDatabase } = await import('./setupDatabase.js')
    await setupDatabase()

  } catch (error) {
    console.error('Error running migration:', error.message)
    if (error.message.includes('permission denied')) {
      console.log('\nIt seems you don\'t have permission to run SQL commands directly.')
      console.log('Please go to your Supabase dashboard (https://app.supabase.com)')
      console.log('Navigate to your project > SQL editor')
      console.log('Copy and paste the contents of src/scripts/setup_database.sql')
      console.log('Then run it manually in the SQL editor')
      console.log('\nAfter that, run: node src/scripts/setupDatabase.js')
    }
    process.exit(1)
  }
}

runMigration() 