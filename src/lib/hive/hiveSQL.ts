'use server'
import sql from 'mssql';
import fs from 'fs';
import path from 'path';

async function fetchAndSavePayouts() {
  const config: sql.config = {
    user: 'Hive-skatehacker',
    password: 'ZRNwN4dPS8HXdeZTa6BR',
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
      totalHbdPayout,
      totalCuratorPayout,
      totalPayout,
    };

    // Define file path
    const filePath = path.join(process.cwd(), 'payouts.json');

    // Check if the file exists, if not create it
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }

    // Read existing data from the file
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as typeof data[];

    // Append new data to the file
    existingData.push(data);

    // Save updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');

    //console.log('Payouts data saved successfully:', data);

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

/**
 * Reads the payouts JSON file, checks the date, and updates if necessary.
 * @returns {Promise<number>} The total payout.
 */
export async function getTotalPayout(): Promise<number> {
  const filePath = path.join(process.cwd(), 'payouts.json');

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist. Fetching data...');
      const { totalPayout } = await fetchAndSavePayouts();
      return totalPayout;
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('File is empty or invalid. Fetching data...');
      const { totalPayout } = await fetchAndSavePayouts();
      return totalPayout;
    }

    // Get the latest record
    const latestRecord = data[data.length - 1];
    const { date, totalPayout } = latestRecord;

    if (!date || !totalPayout) {
      console.log('Invalid data in the file. Fetching data...');
      const updatedData = await fetchAndSavePayouts();
      return updatedData.totalPayout;
    }

    const lastUpdated = new Date(date);
    const now = new Date();

    // Check if the last update is more than 24 hours ago
    const timeDifference = now.getTime() - lastUpdated.getTime();
    const isOlderThan24Hours = timeDifference > 24 * 60 * 60 * 1000;

    if (isOlderThan24Hours) {
      //console.log('Data is older than 24 hours. Fetching updated data...');
      const updatedData = await fetchAndSavePayouts();
      return updatedData.totalPayout;
    }

    //console.log('Returning the latest total payout from file:', totalPayout);
    return totalPayout;

  } catch (error) {
    console.error('Error handling payout data:', error);
    throw error;
  }
}
