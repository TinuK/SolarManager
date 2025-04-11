import { config } from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { subHours, format } from 'date-fns';

// Load environment variables
config();

const INTERVAL = 300000; // 15000 = 15s 300000 = 5m
const SOLAREDGE_API_KEY = process.env.VITE_SOLAREDGE_API_KEY;
const SOLAREDGE_SITE_ID = process.env.VITE_SOLAREDGE_SITE_ID;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Use service role key

if (!SOLAREDGE_API_KEY || !SOLAREDGE_SITE_ID) {
  console.error('Missing SolarEdge environment variables');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fetchSolarEdgeData(startTime, endTime) {
  const url = `https://monitoringapi.solaredge.com/site/${SOLAREDGE_SITE_ID}/powerDetails?startTime=${startTime}&endTime=${endTime}&api_key=${SOLAREDGE_API_KEY}`;
  
  console.log(`Fetching data from SolarEdge API: ${startTime} to ${endTime}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SolarEdge API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch SolarEdge data:', error);
    throw error;
  }
}

async function processSolarData() {
  try {
    // Get data for the last hour
    const endTime = new Date();
    const startTime = subHours(endTime, 1);
    
    const formattedStartTime = format(startTime, "yyyy-MM-dd HH:mm:ss");
    const formattedEndTime = format(endTime, "yyyy-MM-dd HH:mm:ss");
    
    const data = await fetchSolarEdgeData(formattedStartTime, formattedEndTime);
    
    if (!data?.powerDetails?.meters) {
      console.log('No meter data available from SolarEdge API');
      return;
    }

    // Process the latest measurements
    const meters = data.powerDetails.meters;
    const timestamp = new Date().toISOString();
    
    // Find the latest values for each meter
    const production = meters.find(m => m.type === 'Production')?.values.slice(-1)[0]?.value || 0;
    const consumption = meters.find(m => m.type === 'Consumption')?.values.slice(-1)[0]?.value || 0;
    const import_power = meters.find(m => m.type === 'Import')?.values.slice(-1)[0]?.value || 0;
    const export_power = meters.find(m => m.type === 'Export')?.values.slice(-1)[0]?.value || 0;

    console.log('Latest measurements:', {
      production,
      consumption,
      import_power,
      export_power
    });

    // Calculate derived values
    const self_consumption = production > 0 ? ((production - export_power) / production) * 100 : 0;
    const self_sufficiency = consumption > 0 ? ((consumption - import_power) / consumption) * 100 : 0;
    const co2_saved = production * 0.4; // Rough estimate: 0.4 kg CO2 per kWh
    const additional_consumer = Math.max(0, consumption - import_power - (production - export_power));

    // Store in database
    const measurement = {
      timestamp,
      production_kw: production / 1000, // Convert W to kW
      consumption_kw: consumption / 1000,
      grid_import_kw: import_power / 1000,
      grid_export_kw: export_power / 1000,
      self_consumption_percent: self_consumption,
      self_sufficiency_percent: self_sufficiency,
      co2_saved_kg: co2_saved,
      additional_consumer_kw: additional_consumer / 1000
    };

    console.log('Storing measurement:', measurement);

    const { error } = await supabase
      .from('solar_measurements')
      .insert([measurement]);

    if (error) {
      console.error('Error storing measurement in Supabase:', error);
    } else {
      console.log('Successfully stored measurement at:', timestamp);
    }
  } catch (error) {
    console.error('Error in processSolarData:', error);
  }
}

// Initial run
console.log('Starting solar data worker...');
processSolarData();

// Set up interval
setInterval(processSolarData, INTERVAL);

console.log('Solar data worker running. Fetching data every 15 seconds...');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down solar data worker...');
  process.exit(0);
});