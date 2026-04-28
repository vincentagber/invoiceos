import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function listTables() {
    console.log('Listing tables...');
    
    // We can use a trick: query pg_catalog if we have service role key
    const { data, error } = await supabase.rpc('get_tables'); // If RPC exists
    
    if (error) {
        // Fallback: Try a known table to see schema
        console.log('RPC get_tables failed, trying to list via metadata...');
        const { data: qData, error: qError } = await supabase.from('invoices').select('*').limit(1);
        if (qError) {
            console.error('Error fetching invoices:', qError);
        } else {
            console.log('Invoices table exists.');
        }
    } else {
        console.log('Tables:', data);
    }
}

listTables();
