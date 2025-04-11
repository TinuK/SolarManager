import React, { useState, useEffect } from 'react';
import { format, startOfDay, startOfHour, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Battery, Zap, Factory, ChevronLeft, ChevronRight, Download, Sunrise, Sunset, Zap as Energy } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { SolarMeasurement } from '../types/solar';
import { exportToCSV } from '../lib/export';
import { getSunTimes } from '../lib/sunTimes';
import { getDailyProduction } from '../lib/api';

interface DashboardProps {
  currentData: SolarMeasurement;
  historicalData: SolarMeasurement[];
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Dashboard({ 
  currentData, 
  historicalData,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  currentPage,
  totalPages,
  onPageChange
}: DashboardProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [sunTimes, setSunTimes] = useState<{ sunrise: Date; sunset: Date } | null>(null);
  const [dailyProduction, setDailyProduction] = useState<number>(0);

  useEffect(() => {
    const times = getSunTimes(new Date());
    setSunTimes(times);
  }, []);

  useEffect(() => {
    const fetchDailyProduction = async () => {
      try {
        const production = await getDailyProduction(new Date());
        setDailyProduction(production);
      } catch (error) {
        console.error('Error fetching daily production:', error);
      }
    };

    fetchDailyProduction();
    const interval = setInterval(fetchDailyProduction, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const filename = `solar-data-${format(startDate, 'yyyy-MM-dd')}-to-${format(endDate, 'yyyy-MM-dd')}`;
    exportToCSV(historicalData, filename);
  };

  const handleQuickRange = (range: 'hour' | 'today' | 'threeDays') => {
    const now = new Date();
    let start: Date;
    
    switch (range) {
      case 'hour':
        start = startOfHour(now);
        break;
      case 'today':
        start = startOfDay(now);
        break;
      case 'threeDays':
        start = subDays(now, 3);
        break;
    }
    
    onStartDateChange(start);
    onEndDateChange(now);
  };

  // Sort data chronologically for the chart
  const sortedChartData = [...historicalData].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            <Energy className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-gray-500 text-sm">Today's Production</h3>
              <p className="text-2xl font-semibold">{dailyProduction} kWh</p>
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

      {/* Sun Times */}
      {sunTimes && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <Sunrise className="w-6 h-6 text-amber-500" />
              <div>
                <h3 className="text-gray-500 text-sm">Sunrise</h3>
                <p className="text-lg font-semibold">{format(sunTimes.sunrise, 'HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Sunset className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="text-gray-500 text-sm">Sunset</h3>
                <p className="text-lg font-semibold">{format(sunTimes.sunset, 'HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => onStartDateChange(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="border rounded-md p-2"
                maxDate={endDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => onEndDateChange(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="border rounded-md p-2"
                minDate={startDate}
                maxDate={new Date()}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quick Select</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickRange('hour')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  Current Hour
                </button>
                <button
                  onClick={() => handleQuickRange('today')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  Today
                </button>
                <button
                  onClick={() => handleQuickRange('threeDays')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  Last 3 Days
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Power Overview</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd HH:mm')}
                formatter={(value: number) => [`${value.toFixed(1)} kW`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="production_kw" 
                stroke="#EAB308" 
                name="Production" 
                strokeWidth={hoveredMetric === 'production' ? 3 : 1}
                opacity={hoveredMetric && hoveredMetric !== 'production' ? 0.3 : 1}
              />
              <Line 
                type="monotone" 
                dataKey="consumption_kw" 
                stroke="#22C55E" 
                name="Consumption" 
                strokeWidth={hoveredMetric === 'consumption' ? 3 : 1}
                opacity={hoveredMetric && hoveredMetric !== 'consumption' ? 0.3 : 1}
              />
              <Line 
                type="monotone" 
                dataKey="additional_consumer_kw" 
                stroke="#A855F7" 
                name="Additional Consumer" 
                strokeWidth={hoveredMetric === 'additional_consumer' ? 3 : 1}
                opacity={hoveredMetric && hoveredMetric !== 'additional_consumer' ? 0.3 : 1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Historical Data</h2>
        </div>
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
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-yellow-50"
                    onMouseEnter={() => setHoveredMetric('production')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    {measurement.production_kw.toFixed(1)}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-green-50"
                    onMouseEnter={() => setHoveredMetric('consumption')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    {measurement.consumption_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.grid_import_kw.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {measurement.grid_export_kw.toFixed(1)}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-purple-50"
                    onMouseEnter={() => setHoveredMetric('additional_consumer')}
                    onMouseLeave={() => setHoveredMetric(null)}
                  >
                    {measurement.additional_consumer_kw.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}