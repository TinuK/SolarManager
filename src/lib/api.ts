import { supabase } from './supabase';
import type { SolarMeasurement, SolarEdgeApiResponse } from '../types/solar';
import { startOfDay, endOfDay } from 'date-fns';

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

export async function getHistoricalData(
  startDate?: Date,
  endDate?: Date,
  page: number = 1,
  pageSize: number = 24
): Promise<{ data: SolarMeasurement[]; count: number }> {
  let query = supabase
    .from('solar_measurements')
    .select('*', { count: 'exact' });

  if (startDate && endDate) {
    query = query.gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString());
  }

  const { data, error, count } = await query
    .order('timestamp', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }

  return { 
    data: data || [], 
    count: count || 0 
  };
}

export async function getDailyProduction(date: Date = new Date()): Promise<number> {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const { data, error } = await supabase
    .from('solar_measurements')
    .select('production_kw, timestamp')
    .gte('timestamp', start.toISOString())
    .lte('timestamp', end.toISOString())
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching daily production:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Calculate kWh by integrating over the measurements
  let totalKwh = 0;
  for (let i = 1; i < data.length; i++) {
    const prevTime = new Date(data[i - 1].timestamp);
    const currTime = new Date(data[i].timestamp);
    const hoursDiff = (currTime.getTime() - prevTime.getTime()) / (1000 * 60 * 60);
    
    // Average power over the interval
    const avgKw = (data[i - 1].production_kw + data[i].production_kw) / 2;
    
    // Add energy for this interval
    totalKwh += avgKw * hoursDiff;
  }

  return Number(totalKwh.toFixed(2));
}