import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { getHistoricalData } from './lib/api';
import type { SolarMeasurement } from './types/solar';

function App() {
  const [currentData, setCurrentData] = useState<SolarMeasurement | null>(null);
  const [historicalData, setHistoricalData] = useState<SolarMeasurement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getHistoricalData(24);
        if (data.length > 0) {
          setCurrentData(data[0]);
          setHistoricalData(data);
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
  }, []);

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

  return <Dashboard currentData={currentData} historicalData={historicalData} />;
}

export default App;