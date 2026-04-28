import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function checkTables() {
    console.log('Checking tables...');
    
    const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1);
    
    if (subError) {
        console.error('Error fetching subscriptions:', subError);
    } else {
        console.log('Subscriptions table exists.');
    }

    const { data: transData, error: transError } = await supabase
        .from('subscription_transactions')
        .select('*')
        .limit(1);
    
    if (transError) {
        console.error('Error fetching transactions:', transError);
    } else {
        console.log('Transactions table exists.');
    }
}

checkTables();
