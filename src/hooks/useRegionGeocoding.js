// Custom hook for managing region geocoding
import { useState, useEffect, useCallback } from 'react';
import { processRegions, getGeocodingSummary } from '../utils/geocoding';

export const useRegionGeocoding = () => {
  const [regions, setRegions] = useState([]);
  const [processedRegions, setProcessedRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geocodingSummary, setGeocodingSummary] = useState(null);

  /**
   * Process regions and geocode any missing coordinates
   */
  const geocodeRegions = useCallback(async (regionsData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.info('🗺️ Processing regions for geocoding...');
      const processed = await processRegions(regionsData);
      
      setProcessedRegions(processed);
      setRegions(regionsData);
      
      const summary = getGeocodingSummary(processed);
      setGeocodingSummary(summary);
      
      // Log summary for debugging
      console.info('📊 Geocoding Summary:', summary);
      
      if (summary.newlyGeocoded > 0) {
        console.info(`🆕 Found ${summary.newlyGeocoded} new regions that were geocoded live!`);
      }
      
      if (summary.failed > 0) {
        console.warn(`⚠️ Failed to geocode ${summary.failed} regions`);
      }
      
    } catch (err) {
      console.error('❌ Error processing regions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get regions that have valid coordinates for map display
   */
  const getValidRegions = useCallback(() => {
    return processedRegions.filter(region => region.hasCoordinates);
  }, [processedRegions]);

  /**
   * Get regions that failed geocoding
   */
  const getFailedRegions = useCallback(() => {
    return processedRegions.filter(region => !region.hasCoordinates);
  }, [processedRegions]);

  /**
   * Get newly discovered regions
   */
  const getNewRegions = useCallback(() => {
    return processedRegions.filter(region => region.isNewRegion);
  }, [processedRegions]);

  return {
    // Data
    regions,
    processedRegions,
    geocodingSummary,
    
    // State
    isLoading,
    error,
    
    // Actions
    geocodeRegions,
    
    // Computed getters
    getValidRegions,
    getFailedRegions, 
    getNewRegions
  };
};
