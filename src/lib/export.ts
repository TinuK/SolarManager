import { SolarMeasurement } from '../types/solar';
import { format } from 'date-fns';

export function exportToCSV(data: SolarMeasurement[], filename: string = 'solar-data'): void {
  // Define CSV headers
  const headers = [
    'Timestamp',
    'Production (kW)',
    'Consumption (kW)',
    'Grid Import (kW)',
    'Grid Export (kW)',
    'Self Consumption (%)',
    'Self Sufficiency (%)',
    'CO2 Saved (kg)',
    'Additional Consumer (kW)'
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(row => [
      format(new Date(row.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      row.production_kw.toFixed(2),
      row.consumption_kw.toFixed(2),
      row.grid_import_kw.toFixed(2),
      row.grid_export_kw.toFixed(2),
      row.self_consumption_percent.toFixed(2),
      row.self_sufficiency_percent.toFixed(2),
      row.co2_saved_kg.toFixed(2),
      row.additional_consumer_kw.toFixed(2)
    ].join(','))
  ];

  // Create CSV content
  const csvContent = csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}