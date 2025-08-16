// Linode API service functions
const LINODE_API_BASE = 'https://api.linode.com/v4';

/**
 * Fetch all Linode regions
 */
export const fetchRegions = async () => {
  try {
    const response = await fetch(`${LINODE_API_BASE}/regions`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw new Error('Unable to load regions data from API');
  }
};

/**
 * Fetch availability for a specific region
 */
export const fetchRegionAvailability = async (regionId) => {
  try {
    const response = await fetch(`${LINODE_API_BASE}/regions/${regionId}/availability`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch availability: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching availability for region ${regionId}:`, error);
    throw new Error(`Unable to load availability data for region ${regionId}`);
  }
};
