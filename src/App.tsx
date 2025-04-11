import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { getHistoricalData } from './lib/api';
import type { SolarMeasurement } from './types/solar';
import { subDays } from 'date-fns';

function App() {
  const [currentData, setCurrentData] = useState<SolarMeasurement | null>(null);
  const [historicalData, setHistoricalData] = useState<SolarMeasurement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    async function fetchData() {
      try {
        // First get the total count to calculate valid page range
        const { count } = await getHistoricalData(startDate, endDate, 1, 1);
        const maxPage = Math.max(1, Math.ceil(count / pageSize));
        
        // Adjust current page if it exceeds the maximum
        const adjustedPage = Math.min(currentPage, maxPage);
        if (adjustedPage !== currentPage) {
          setCurrentPage(adjustedPage);
          return; // The state update will trigger another useEffect run
        }

        const { data } = await getHistoricalData(startDate, endDate, adjustedPage, pageSize);
        if (data.length > 0) {
          setCurrentData(data[0]);
          setHistoricalData(data);
          setTotalPages(maxPage);
        } else {
          setError('No solar data available - but access to database successfully');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch solar data. Please check your connection and try again.');
      }
    }
    
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [startDate, endDate, currentPage]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Dashboard 
      currentData={currentData} 
      historicalData={historicalData}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
}

export default App;