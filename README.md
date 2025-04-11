# Solar Dashboard

A real-time solar power monitoring dashboard that integrates with SolarEdge API and displays production, consumption, and grid metrics.

## Features

- Real-time solar production monitoring
- Historical data visualization
- Power consumption analysis
- Grid import/export tracking
- Self-consumption metrics
- CO2 savings calculation

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Supabase
- SolarEdge API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your credentials:
   ```
   VITE_SOLAREDGE_API_KEY=your_api_key
   VITE_SOLAREDGE_SITE_ID=your_site_id
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Start the data collection worker:
   ```bash
   npm run worker
   ```

## License

MIT
