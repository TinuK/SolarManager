export interface SolarMeasurement {
  id: string;
  timestamp: string;
  production_kw: number;
  consumption_kw: number;
  grid_import_kw: number;
  grid_export_kw: number;
  self_consumption_percent: number;
  self_sufficiency_percent: number;
  co2_saved_kg: number;
  additional_consumer_kw: number;
}

export interface SolarEdgeApiResponse {
  // Define based on actual SolarEdge API response
  energy: {
    timeUnit: string;
    unit: string;
    values: Array<{
      date: string;
      value: number;
    }>;
  };
}