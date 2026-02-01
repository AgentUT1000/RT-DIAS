// News API Service using newsdata.io
const API_KEY = 'pub_22a2f16c2b3e4e2f8f9034fda2582ec3';
const BASE_URL = 'https://newsdata.io/api/1';

// Default configuration for South Asian disaster news
const DEFAULT_CONFIG = {
  countries: 'in,np,bt',           // India, Nepal, Bhutan
  languages: 'hi,ta,ml,en,kn',     // Hindi, Tamil, Malayalam, English, Kannada
  categories: 'education,world,science,environment',
};

/**
 * Fetch latest disaster-related news
 * @param {Object} options - Query options
 * @param {string} options.query - Search keywords
 * @param {string} options.category - News category (e.g., 'environment', 'world')
 * @param {string} options.country - Country codes (e.g., 'in,np,bt')
 * @param {string} options.language - Language codes (e.g., 'en,hi')
 * @param {number} options.size - Number of results (max 10 for free tier)
 * @returns {Promise<Object>} News data
 */
export const fetchNews = async (options = {}) => {
  const {
    query = '',
    category = DEFAULT_CONFIG.categories,
    country = DEFAULT_CONFIG.countries,
    language = DEFAULT_CONFIG.languages,
  } = options;

  const params = new URLSearchParams({
    apikey: API_KEY,
    language,
    country,
  });

  if (query) params.append('q', query);
  if (category) params.append('category', category);

  try {
    const response = await fetch(`${BASE_URL}/latest?${params}`);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.results?.message || 'Failed to fetch news');
    }

    return {
      success: true,
      articles: data.results || [],
      totalResults: data.totalResults || 0,
      nextPage: data.nextPage || null,
    };
  } catch (error) {
    console.error('News API Error:', error);
    return {
      success: false,
      articles: [],
      error: error.message,
    };
  }
};

/**
 * Fetch disaster-specific news
 * @param {string} disasterType - Type of disaster (earthquake, flood, etc.)
 * @returns {Promise<Object>} News data
 */
export const fetchDisasterNews = async (disasterType = '') => {
  const disasterKeywords = {
    earthquake: 'earthquake seismic tremor भूकंप',
    flood: 'flood flooding flash flood बाढ़ வெள்ளம்',
    cyclone: 'cyclone hurricane typhoon storm चक्रवात புயல்',
    landslide: 'landslide mudslide भूस्खलन',
    wildfire: 'wildfire forest fire bushfire जंगल की आग',
    tsunami: 'tsunami tidal wave सुनामी',
    drought: 'drought water scarcity सूखा',
    volcano: 'volcano volcanic eruption ज्वालामुखी',
  };

  const query = disasterType 
    ? disasterKeywords[disasterType.toLowerCase()] || disasterType
    : 'disaster emergency natural calamity आपदा';

  return fetchNews({
    query,
    category: 'environment,world,science',
  });
};

/**
 * Fetch news for a specific location
 * @param {string} location - Location name
 * @param {string} country - Country codes
 * @returns {Promise<Object>} News data
 */
export const fetchLocationNews = async (location, country = DEFAULT_CONFIG.countries) => {
  return fetchNews({
    query: `${location} disaster emergency`,
    country,
  });
};

/**
 * Fetch breaking/latest emergency news
 * @returns {Promise<Object>} News data
 */
export const fetchBreakingNews = async () => {
  return fetchNews({
    query: 'breaking emergency disaster alert warning',
    category: 'world,environment,science',
  });
};

/**
 * Fetch weather-related news
 * @returns {Promise<Object>} News data
 */
export const fetchWeatherNews = async () => {
  return fetchNews({
    query: 'weather storm rain cyclone heat wave cold wave मौसम',
    category: 'environment,science',
  });
};

/**
 * Search news by custom query
 * @param {string} searchQuery - Search term
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} News data
 */
export const searchNews = async (searchQuery, options = {}) => {
  return fetchNews({
    query: searchQuery,
    ...options,
  });
};

// News categories available in newsdata.io
export const NEWS_CATEGORIES = [
  { id: 'world', label: 'World', icon: '🌍' },
  { id: 'environment', label: 'Environment', icon: '🌿' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'health', label: 'Health', icon: '🏥' },
  { id: 'technology', label: 'Technology', icon: '💻' },
];

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

// Supported countries
export const SUPPORTED_COUNTRIES = [
  { code: 'in', label: 'India', flag: '🇮🇳' },
  { code: 'np', label: 'Nepal', flag: '🇳🇵' },
  { code: 'bt', label: 'Bhutan', flag: '🇧🇹' },
];

// Disaster types for filtering
export const DISASTER_TYPES = [
  { id: 'all', label: 'All Disasters', icon: '🚨' },
  { id: 'earthquake', label: 'Earthquake', icon: '🌋' },
  { id: 'flood', label: 'Flood', icon: '🌊' },
  { id: 'cyclone', label: 'Cyclone', icon: '🌀' },
  { id: 'wildfire', label: 'Wildfire', icon: '🔥' },
  { id: 'landslide', label: 'Landslide', icon: '⛰️' },
  { id: 'tsunami', label: 'Tsunami', icon: '🌊' },
];

export default {
  fetchNews,
  fetchDisasterNews,
  fetchLocationNews,
  fetchBreakingNews,
  fetchWeatherNews,
  searchNews,
  NEWS_CATEGORIES,
  DISASTER_TYPES,
  SUPPORTED_LANGUAGES,
  SUPPORTED_COUNTRIES,
  DEFAULT_CONFIG,
};
