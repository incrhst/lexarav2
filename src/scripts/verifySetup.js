import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

async function verifySetup() {
    console.log('Starting setup verification...');

    // Check if Supabase configuration exists
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Error: Supabase configuration is missing. Please check your .env file.');
        process.exit(1);
    }

    console.log('✓ Supabase configuration found');

    // Initialize Supabase client
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
    );

    try {
        // Test Supabase connection
        const { data: testData, error: testError } = await supabase
            .from('user_roles')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('Error: Could not connect to Supabase or access user_roles table:', testError.message);
            process.exit(1);
        }

        console.log('✓ Supabase connection successful');

        // Check if admin user exists
        const { data: adminData, error: adminError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('email', 'admin@lexara.com')
            .single();

        if (adminError) {
            console.log('Creating admin user...');
            
            // Create admin user
            const { error: signUpError } = await supabase.auth.signUp({
                email: 'admin@lexara.com',
                password: 'abc123',
            });

            if (signUpError && signUpError.message !== 'User already registered') {
                console.error('Error creating admin user:', signUpError.message);
                process.exit(1);
            }

            // Insert admin role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert([
                    {
                        email: 'admin@lexara.com',
                        role: 'admin',
                    },
                ]);

            if (roleError) {
                console.error('Error creating admin role:', roleError.message);
                process.exit(1);
            }

            console.log('✓ Admin user created successfully');
        } else {
            console.log('✓ Admin user already exists');
        }

        console.log('\nSetup verification completed successfully!');
        console.log('\nYou can now:');
        console.log('1. Start the application with: npm run dev');
        console.log('2. Log in with:');
        console.log('   Email: admin@lexara.com');
        console.log('   Password: abc123');

    } catch (error) {
        console.error('Unexpected error during verification:', error);
        process.exit(1);
    }
}

verifySetup(); 