import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const trademarkApplications = [
  {
    title: 'TechGear Pro',
    description: 'Technology accessories and gadgets',
    status: 'active',
    goods_services_class: ['9', '35'],
    filing_date: '2024-01-15',
    jurisdiction: 'UK',
  },
  {
    title: 'EcoFresh Foods',
    description: 'Organic food products and beverages',
    status: 'pending',
    goods_services_class: ['29', '30', '31'],
    filing_date: '2024-02-01',
    jurisdiction: 'UK',
  },
  {
    title: 'FitLife Gear',
    description: 'Fitness equipment and apparel',
    status: 'draft',
    goods_services_class: ['25', '28'],
    filing_date: '2024-02-15',
    jurisdiction: 'UK',
  }
];

const patentApplications = [
  {
    title: 'Smart Energy Storage System',
    description: 'Advanced battery technology for renewable energy storage',
    status: 'active',
    technical_field: 'Energy Storage',
    filing_date: '2024-01-10',
    jurisdiction: 'UK',
  },
  {
    title: 'AI-Powered Medical Diagnostic Tool',
    description: 'Machine learning system for early disease detection',
    status: 'pending',
    technical_field: 'Medical Technology',
    filing_date: '2024-02-05',
    jurisdiction: 'UK',
  }
];

const oppositions = [
  {
    grounds: 'Similar trademark exists in the same class',
    status: 'pending',
    filing_date: '2024-02-20',
  },
  {
    grounds: 'Likelihood of confusion with existing brand',
    status: 'active',
    filing_date: '2024-02-10',
  }
];

const deadlines = [
  {
    title: 'Response to Examination Report',
    description: 'Submit response to trademark examination report',
    due_date: '2024-04-15',
    priority: 'high',
    completed: false,
  },
  {
    title: 'Opposition Period Ends',
    description: 'Last day to file opposition',
    due_date: '2024-05-01',
    priority: 'medium',
    completed: false,
  },
  {
    title: 'Renewal Fee Payment',
    description: 'Pay trademark renewal fee',
    due_date: '2024-06-15',
    priority: 'high',
    completed: false,
  }
];

async function seedTestData() {
  try {
    console.log('Starting to seed test data...');

    // Get the admin user ID
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .single();

    if (adminError) throw adminError;
    const adminId = adminData.user_id;

    // Insert trademark applications
    console.log('Inserting trademark applications...');
    for (const app of trademarkApplications) {
      const { error } = await supabase
        .from('applications')
        .insert([{
          ...app,
          applicant_id: adminId,
          application_type: 'trademark',
          applicant_name: 'Test Applicant',
          contact_email: 'test@example.com',
          contact_phone: '+44 1234567890',
          applicant_address: '123 Test Street, London',
          applicant_country: 'UK',
        }]);
      if (error) throw error;
    }

    // Insert patent applications
    console.log('Inserting patent applications...');
    for (const app of patentApplications) {
      const { error } = await supabase
        .from('applications')
        .insert([{
          ...app,
          applicant_id: adminId,
          application_type: 'patent',
          applicant_name: 'Test Applicant',
          contact_email: 'test@example.com',
          contact_phone: '+44 1234567890',
          applicant_address: '123 Test Street, London',
          applicant_country: 'UK',
        }]);
      if (error) throw error;
    }

    // Get first trademark application for oppositions
    const { data: firstApp, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('application_type', 'trademark')
      .limit(1)
      .single();

    if (appError) throw appError;

    // Insert oppositions
    console.log('Inserting oppositions...');
    for (const opp of oppositions) {
      const { error } = await supabase
        .from('oppositions')
        .insert([{
          ...opp,
          application_id: firstApp.id,
          opponent_id: adminId,
        }]);
      if (error) throw error;
    }

    // Insert deadlines
    console.log('Inserting deadlines...');
    for (const deadline of deadlines) {
      const { error } = await supabase
        .from('deadlines')
        .insert([{
          ...deadline,
          user_id: adminId,
          entity_type: 'application',
          entity_id: firstApp.id,
          reminder_days: [7, 3, 1],
        }]);
      if (error) throw error;
    }

    console.log('Test data seeded successfully!');
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData(); 