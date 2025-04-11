import { supabase } from './supabase';
import type { SolarMeasurement, SolarEdgeApiResponse } from '../types/solar';

const SOLAREDGE_API_KEY = import.meta.env.VITE_SOLAREDGE_API_KEY;
const SOLAREDGE_SITE_ID = import.meta.env.VITE_SOLAREDGE_SITE_ID;

export async function fetchSolarEdgeData(startTime: string, endTime: string): Promise<SolarEdgeApiResponse> {
  const response = await fetch(
    `https://monitoringapi.solaredge.com/site/${SOLAREDGE_SITE_ID}/energy?timeUnit=HOUR&startTime=${startTime}&endTime=${endTime}&api_key=${SOLAREDGE_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch SolarEdge data');
  }

  return response.json();
}

export async function storeMeasurement(measurement: Omit<SolarMeasurement, 'id'>) {
  const { data, error } = await supabase
    .from('solar_measurements')
    .insert([measurement])
    .select()
    .single();

  if (error) {
    console.error('Error storing measurement:', error);
    throw error;
  }
  return data;
}

export async function getHistoricalData(hours: number = 24): Promise<SolarMeasurement[]> {
  const { data, error } = await supabase
    .from('solar_measurements')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(hours);

  if (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
  return data || [];
}