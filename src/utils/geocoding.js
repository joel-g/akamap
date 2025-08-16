// Geocoding utilities for Akamap
import coordinatesData from '../data/coordinates.json';

// Cache for runtime geocoded locations
const GEOCODE_CACHE_KEY = 'akamap_geocoded_locations';
const GEOCODE_API_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Get cached geocoded locations from localStorage
 */
const getCachedCoordinates = () => {
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.warn('Failed to load geocode cache:', error);
    return {};
  }
};

/**
 * Save geocoded location to localStorage cache
 */
const saveCachedCoordinates = (location, coordinates) => {
  try {
    const cached = getCachedCoordinates();
    cached[location] = {
      ...coordinates,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to cache geocoded coordinates:', error);
  }
};

/**
 * Geocode a location using Nominatim API
 */
const geocodeLocation = async (location) => {
  try {
    const encodedLocation = encodeURIComponent(location);
    const response = await fetch(
      `${GEOCODE_API_URL}?format=json&q=${encodedLocation}&limit=1`,
      {
        headers: {
          'User-Agent': 'Akamap/1.0 (Interactive Linode Regions Map)'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        isNew: true // Mark as newly geocoded
      };
      
      // Cache the result
      saveCachedCoordinates(location, coordinates);
      
      return coordinates;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to geocode location "${location}":`, error);
    return null;
  }
};

/**
 * Get coordinates for a region location
 * Priority: 1) Bundled coordinates, 2) Cached coordinates, 3) Live geocoding
 */
export const getRegionCoordinates = async (location) => {
  // 1. Check bundled coordinates first
  if (coordinatesData[location]) {
    return {
      ...coordinatesData[location],
      isNew: false
    };
  }
  
  // 2. Check localStorage cache
  const cachedCoordinates = getCachedCoordinates();
  if (cachedCoordinates[location]) {
    return cachedCoordinates[location];
  }
  
  // 3. Geocode the location live
  console.info(`🗺️ Geocoding new region: ${location}`);
  const coordinates = await geocodeLocation(location);
  
  if (coordinates) {
    console.info(`✅ Successfully geocoded: ${location}`, coordinates);
  } else {
    console.warn(`❌ Failed to geocode: ${location}`);
  }
  
  return coordinates;
};

/**
 * Batch process multiple regions and get their coordinates
 */
export const processRegions = async (regions) => {
  const processedRegions = [];
  
  for (const region of regions) {
    const coordinates = await getRegionCoordinates(region.label);
    
    processedRegions.push({
      ...region,
      coordinates,
      hasCoordinates: !!coordinates,
      isNewRegion: coordinates?.isNew || false
    });
    
    // Add small delay for live geocoding to be respectful to API
    if (coordinates?.isNew) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return processedRegions;
};

/**
 * Get summary of geocoding status
 */
export const getGeocodingSummary = (processedRegions) => {
  const summary = processedRegions.reduce((acc, region) => {
    if (!region.hasCoordinates) {
      acc.failed++;
    } else if (region.isNewRegion) {
      acc.newlyGeocoded++;
    } else {
      acc.bundled++;
    }
    return acc;
  }, {
    bundled: 0,
    newlyGeocoded: 0,
    failed: 0,
    total: processedRegions.length
  });
  
  return summary;
};

/**
 * Clear geocoding cache (useful for development/testing)
 */
export const clearGeocodingCache = () => {
  try {
    localStorage.removeItem(GEOCODE_CACHE_KEY);
    console.info('🗑️ Geocoding cache cleared');
  } catch (error) {
    console.warn('Failed to clear geocoding cache:', error);
  }
};
