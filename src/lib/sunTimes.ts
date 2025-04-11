import SunCalc from 'suncalc';

// Coordinates for the solar installation location
// These should ideally come from configuration, but for now we'll hardcode them
const LATITUDE = 51.5074; // Example: London
const LONGITUDE = -0.1278;

export function getSunTimes(date: Date) {
  const times = SunCalc.getTimes(date, LATITUDE, LONGITUDE);
  
  return {
    sunrise: times.sunrise,
    sunset: times.sunset
  };
}