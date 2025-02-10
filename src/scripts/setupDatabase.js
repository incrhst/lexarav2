import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../.env');

// Load environment variables from .env file
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
    }
});

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        
        // Create user_roles table first
        const { error: createRolesError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(1);

        if (createRolesError) {
            if (createRolesError.message.includes('does not exist')) {
                console.log('Creating user_roles table...');
                await supabase.from('user_roles').insert({
                    user_id: '00000000-0000-0000-0000-000000000000',
                    role: 'admin'
                }).select();
                console.log('User roles table created');
            } else {
                console.log('User roles table already exists');
            }
        }

        // Create applications table
        const { error: createAppsError } = await supabase
            .from('applications')
            .select('*')
            .limit(1);

        if (createAppsError) {
            if (createAppsError.message.includes('does not exist')) {
                console.log('Creating applications table...');
                await supabase.from('applications').insert({
                    id: '00000000-0000-0000-0000-000000000000',
                    applicant_id: '00000000-0000-0000-0000-000000000000',
                    status: 'draft'
                }).select();
                console.log('Applications table created');
            } else {
                console.log('Applications table already exists');
            }
        }

        // Check for existing admin user
        const { data: existingUser, error: userError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('role', 'admin')
            .single();

        if (userError && !userError.message.includes('No rows found')) {
            throw userError;
        }

        if (!existingUser) {
            console.log('Creating admin user...');
            const { data: userData, error: createError } = await supabase.auth.admin.createUser({
                email: 'admin@lexara.com',
                password: 'abc123',
                email_confirm: true
            });

            if (createError) {
                if (!createError.message.includes('already registered')) {
                    throw createError;
                }
                console.log('Admin user already exists');
            } else {
                console.log('Admin user created successfully');
                
                // Create admin role
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .insert({
                        user_id: userData.user.id,
                        role: 'admin'
                    });

                if (roleError) throw roleError;
                console.log('Admin role assigned successfully');
            }
        } else {
            console.log('Admin user and role already exist');
        }

        console.log('\nSetup completed successfully!');
        console.log('You can now:');
        console.log('1. Start the application with: npm run dev');
        console.log('2. Log in with:');
        console.log('   Email: admin@lexara.com');
        console.log('   Password: abc123');

    } catch (error) {
        console.error('Error during setup:', error.message);
        if (error.message.includes('permission denied')) {
            console.log('\nThis operation requires admin privileges.');
            console.log('Please ensure you are using the service_role key in your .env file');
        }
        process.exit(1);
    }
}

setupDatabase(); 