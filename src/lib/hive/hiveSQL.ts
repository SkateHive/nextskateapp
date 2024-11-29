'use server'

/*
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    total_hbd_payout NUMERIC NOT NULL,
    total_curator_payout NUMERIC NOT NULL,
    total_payout NUMERIC NOT NULL
);
*/

import sql from 'mssql';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is not set in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
 

async function fetchAndSavePayouts() {
  const config: sql.config = {
    user: process.env.HIVESQL_USER,
    password: process.env.HIVESQL_PASSWORD,
    server: 'vip.hivesql.io',
    database: 'DBHive',
    options: {
      encrypt: true, // Use encryption for Azure SQL
      trustServerCertificate: true, // Set to true for self-signed certificates
    },
  };

  let pool: sql.ConnectionPool | null = null;

  try {
    // Connect to the database
    pool = await sql.connect(config);

    const query = `
      SELECT 
        category, 
        SUM(total_payout_value) AS total_hbd_payout, 
        SUM(curator_payout_value) AS curator_payout_value 
      FROM Comments
      WHERE category LIKE 'hive-173115'
        AND total_payout_value <> 0
        AND last_payout > '2017-11-1 23:59:59'
      GROUP BY category
      ORDER BY total_hbd_payout;
    `;

    const result = await pool.request().query(query);

    // Process results
    let totalHbdPayout = 0;
    let totalCuratorPayout = 0;

    result.recordset.forEach(row => {
      totalHbdPayout += row.total_hbd_payout;
      totalCuratorPayout += row.curator_payout_value;
    });

    const totalPayout = totalHbdPayout + totalCuratorPayout;

    const data = {
      date: new Date().toISOString(),
      total_hbd_payout: totalHbdPayout,
      total_curator_payout: totalCuratorPayout,
      total_payout: totalPayout,
    };

    // Save to Supabase
    const { error } = await supabase
      .from('payouts')
      .insert(data);

    if (error) {
      throw new Error(`Error saving to Supabase: ${error.message}`);
    }

    //console.log('Payouts data saved to Supabase:', data);
    return data;

  } catch (error) {
    console.error('Error fetching or saving payouts:', error);
    throw error;
  } finally {
    // Properly close the connection pool
    if (pool) {
      await pool.close();
    }
  }
}

// Fetch total payout from Supabase
export async function getTotalPayout(): Promise<number> {
  try {
    // Fetch the latest record from the Supabase table
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('date', { ascending: false })
      .limit(1); // Removed .single()

    if (error) {
      console.error('Error fetching data from Supabase:', error.message);
      throw error;
    }

    // If no record exists, invoke `fetchAndSavePayouts` to initialize data
    if (!data || data.length === 0) {
      //console.log('No data found in the table. Fetching fresh data...');
      const updatedData = await fetchAndSavePayouts();
      return updatedData.total_payout; // Correct property access
    }

    const { date, total_payout: totalPayout } = data[0]; // Access the first item in the array

    if (!date || totalPayout === undefined) {
      console.log('Invalid data in the table. Fetching fresh data...');
      const updatedData = await fetchAndSavePayouts();
      return updatedData.total_payout; // Correct property access
    }

    const lastUpdated = new Date(date);
    const now = new Date();

    // Check if the last update is more than 24 hours ago
    const timeDifference = now.getTime() - lastUpdated.getTime();
    const isOlderThan24Hours = timeDifference > 24 * 60 * 60 * 1000;

    if (isOlderThan24Hours) {
      //console.log('Data is older than 24 hours. Fetching updated data...');
      const updatedData = await fetchAndSavePayouts();
      return updatedData.total_payout; // Correct property access
    }

    // Return the latest total payout
    //console.log('Returning the latest total payout from Supabase:', totalPayout);
    return totalPayout;

  } catch (error) {
    console.error('Error handling payout data:', error);
    throw error;
  }
}


