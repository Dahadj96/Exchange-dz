
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking listings table ---');
    const { data: lData, error: lError } = await supabase
        .from('listings')
        .select('*')
        .limit(1);

    if (lError) {
        console.error('Error selecting from listings:', lError.message);
    } else {
        console.log('listings columns:', Object.keys(lData[0] || {}));
    }

    console.log('--- Checking offers table ---');
    const { data: oData, error: oError } = await supabase
        .from('offers')
        .select('*')
        .limit(1);

    if (oError) {
        console.error('Error selecting from offers:', oError.message);
    } else {
        console.log('offers columns:', Object.keys(oData[0] || {}));
    }

    console.log('--- Checking trades table ---');
    const { data: tData, error: tError } = await supabase
        .from('trades')
        .select('*')
        .limit(1);

    if (tError) {
        console.error('Error selecting from trades:', tError.message);
    } else {
        console.log('trades columns:', Object.keys(tData[0] || {}));
    }
}

checkSchema();
