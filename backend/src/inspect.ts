import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './lib/supabase';

async function inspect() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching organization:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in organizations table:', Object.keys(data[0]));
  } else {
    console.log('No organizations found to inspect.');
  }
}

inspect();
