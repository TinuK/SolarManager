import React from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Battery, Zap, Factory } from 'lucide-react';
import type { SolarMeasurement } from '../types/solar';

interface DashboardProps {
  currentData: SolarMeasurement;
  historicalData: SolarMeasurement[];
}

export function Dashboard({ currentData, historicalData }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Sun className="w-8 h-8 text-yellow-500" />
            <div>
              <h3 className="text-gray-500 text-sm">Production</h3>
              <p className="text-2xl font-semibold">{currentData.production_kw.toFixed(1)} kW</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Battery className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-gray-500 text-sm">Self-Consumption</h3>
              <p className="text-2xl font-semibold">{currentData.self_consumption_percent}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="text-gray-500 text-sm">Grid Import</h3>
              <p className="text-2xl font-semibold">{currentData.grid_import_kw.toFixed(1)} kW</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <Factory className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="text-gray-500 text-sm">Additional Consumer</h3>
              <p className="text-2xl font-semibold">{currentData.additional_consumer_kw.toFixed(1)} kW</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Power Overview</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd HH:mm')}
                formatter={(value: number) => [`${value.toFixed(1)} kW`, '']}
              />
              <Legend />
              <Line type="monotone" dataKey="production_kw" stroke="#EAB308" name="Production" />
              <Line type="monotone" dataKey="consumption_kw" stroke="#22C55E" name="Consumption" />
              <Line type="monotone" dataKey="additional_consumer_kw" stroke="#A855F7" name="Additional Consumer" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Historical Data</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production (kW)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption (kW)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grid Import (kW)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grid Export (kW)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Consumer (kW)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicalData.map((measurement) => (
                <tr key={measurement.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(measurement.timestamp), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.production_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.consumption_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.grid_import_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.grid_export_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.additional_consumer_kw.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}