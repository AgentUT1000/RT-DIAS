// GDELT Project API Service
// GDELT monitors news media worldwide in real-time - no API key required

const GDELT_DOC_API = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_GEO_API = 'https://api.gdeltproject.org/api/v2/geo/geo';
const GDELT_TV_API = 'https://api.gdeltproject.org/api/v2/tv/tv';

// Simple disaster terms (no OR statements - GDELT uses space as implicit OR)
const DISASTER_TERMS = {
  earthquake: 'earthquake seismic tremor',
  flood: 'flood flooding',
  cyclone: 'cyclone hurricane typhoon',
  tsunami: 'tsunami',
  wildfire: 'wildfire fire',
  landslide: 'landslide mudslide',
  drought: 'drought famine',
  volcano: 'volcano eruption',
  tornado: 'tornado',
  heatwave: 'heatwave',
};

// Country names for query building
const COUNTRY_NAMES = {
  'IN': 'India',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'BD': 'Bangladesh',
  'PK': 'Pakistan',
  'LK': 'Sri Lanka',
  'US': 'United States America',
  'GB': 'United Kingdom Britain',
};

/**
 * Safe fetch wrapper that handles GDELT API quirks
 */
const safeGdeltFetch = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`GDELT returned status ${response.status}`);
      return { success: false, articles: [], error: `API returned ${response.status}` };
    }

    const text = await response.text();
    
    // Empty response is valid - means no results
    if (!text || text.trim() === '' || text.trim() === '{}') {
      return { success: true, articles: [], totalResults: 0 };
    }

    // Check if response looks like JSON
    const trimmed = text.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      console.warn('GDELT returned non-JSON:', trimmed.substring(0, 100));
      return { success: true, articles: [], totalResults: 0 };
    }

    try {
      const data = JSON.parse(text);
      return {
        success: true,
        articles: data.articles || [],
        totalResults: data.articles?.length || 0,
      };
    } catch (parseError) {
      console.warn('GDELT JSON parse failed:', parseError.message);
      return { success: true, articles: [], totalResults: 0 };
    }
  } catch (error) {
    console.error('GDELT fetch error:', error);
    return { success: false, articles: [], error: error.message };
  }
};

/**
 * Build a simple GDELT-friendly query
 */
const buildQuery = (terms, countryCode = '') => {
  let query = terms;
  
  // Add country name if specified
  if (countryCode && COUNTRY_NAMES[countryCode]) {
    query = `${terms} ${COUNTRY_NAMES[countryCode]}`;
  }
  
  return query;
};

/**
 * Search GDELT DOC API for disaster news articles
 */
export const searchGdeltArticles = async (options = {}) => {
  const {
    query = 'disaster emergency',
    maxRecords = 75,
    timespan = '24h',
    sourceCountry = '',
    sort = 'datedesc',
  } = options;

  const finalQuery = buildQuery(query, sourceCountry);

  const params = new URLSearchParams({
    query: finalQuery,
    mode: 'artlist',
    maxrecords: maxRecords.toString(),
    timespan: timespan,
    format: 'json',
    sort: sort,
  });

  const url = `${GDELT_DOC_API}?${params}`;
  return safeGdeltFetch(url);
};

/**
 * Fetch disaster news by type
 */
export const fetchDisasterByType = async (disasterType = 'all', timespan = '24h', countryCode = '') => {
  const query = disasterType === 'all' 
    ? 'disaster emergency crisis calamity'
    : (DISASTER_TERMS[disasterType] || disasterType);

  return searchGdeltArticles({
    query,
    timespan,
    maxRecords: 100,
    sourceCountry: countryCode,
  });
};

/**
 * Fetch disaster news for specific countries
 */
export const fetchDisastersByCountry = async (countryCode = 'IN', timespan = '24h') => {
  return searchGdeltArticles({
    query: 'disaster emergency flood earthquake cyclone crisis',
    sourceCountry: countryCode,
    timespan,
    maxRecords: 150,
  });
};

/**
 * Fetch South Asian disaster news
 */
export const fetchSouthAsiaDisasters = async (timespan = '24h') => {
  // Use a simpler query - just disaster terms, GDELT will find global results
  return searchGdeltArticles({
    query: 'disaster earthquake flood cyclone emergency',
    timespan,
    maxRecords: 100,
  });
};

/**
 * Fetch real-time emergency alerts
 * @returns {Promise<Object>} Emergency news
 */
export const fetchEmergencyAlerts = async () => {
  const query = 'breaking emergency alert warning evacuation';
  
  return searchGdeltArticles({
    query,
    timespan: '4h',
    maxRecords: 25,
    sort: 'datedesc',
  });
};

/**
 * Fetch TV news mentions about disasters
 * @param {string} query - Search query
 * @returns {Promise<Object>} TV mentions data
 */
export const fetchTVMentions = async (query = 'disaster') => {
  const params = new URLSearchParams({
    query: query,
    mode: 'clipgallery',
    maxrecords: '20',
    timespan: '24h',
    format: 'json',
  });

  try {
    const response = await fetch(`${GDELT_TV_API}?${params}`);
    
    if (!response.ok) {
      throw new Error(`GDELT TV API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      clips: data.clips || [],
    };
  } catch (error) {
    console.error('GDELT TV API Error:', error);
    return {
      success: false,
      clips: [],
      error: error.message,
    };
  }
};

// Available time spans
export const TIME_SPANS = [
  { value: '1h', label: 'Last Hour' },
  { value: '4h', label: 'Last 4 Hours' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last Week' },
];

// Disaster types for filtering
export const GDELT_DISASTER_TYPES = [
  { id: 'all', label: 'All Events', icon: '🌍' },
  { id: 'earthquake', label: 'Earthquake', icon: '🌋' },
  { id: 'flood', label: 'Flood', icon: '🌊' },
  { id: 'cyclone', label: 'Cyclone', icon: '🌀' },
  { id: 'tsunami', label: 'Tsunami', icon: '🌊' },
  { id: 'wildfire', label: 'Wildfire', icon: '🔥' },
  { id: 'landslide', label: 'Landslide', icon: '⛰️' },
  { id: 'tornado', label: 'Tornado', icon: '🌪️' },
  { id: 'volcano', label: 'Volcano', icon: '🌋' },
  { id: 'drought', label: 'Drought', icon: '☀️' },
  { id: 'heatwave', label: 'Heat Wave', icon: '🔥' },
];

// Source regions with keywords for filtering
export const SOURCE_REGIONS = [
  { code: '', label: 'Worldwide', flag: '🌍', keywords: [] },
  { code: 'IN', label: 'India', flag: '🇮🇳', keywords: ['india', 'indian', 'delhi', 'mumbai', 'chennai', 'kolkata', 'bangalore', 'hyderabad', 'gujarat', 'maharashtra', 'tamil nadu', 'kerala', 'karnataka', 'rajasthan', 'uttar pradesh', 'bihar', 'odisha', 'assam', 'punjab', 'west bengal', 'ndtv', 'timesofindia', 'hindustantimes', 'thehindu', 'indiatoday', 'indianexpress'] },
  { code: 'NP', label: 'Nepal', flag: '🇳🇵', keywords: ['nepal', 'nepali', 'nepalese', 'kathmandu', 'pokhara', 'himalayan times', 'nepalnews'] },
  { code: 'BT', label: 'Bhutan', flag: '🇧🇹', keywords: ['bhutan', 'bhutanese', 'thimphu', 'paro', 'kuensel'] },
  { code: 'BD', label: 'Bangladesh', flag: '🇧🇩', keywords: ['bangladesh', 'bangladeshi', 'dhaka', 'chittagong', 'khulna', 'sylhet', 'bdnews24', 'dhakatribune', 'dailystar.net'] },
  { code: 'PK', label: 'Pakistan', flag: '🇵🇰', keywords: ['pakistan', 'pakistani', 'karachi', 'lahore', 'islamabad', 'peshawar', 'sindh', 'punjab pakistan', 'geo.tv', 'dawn.com', 'tribune.com.pk'] },
  { code: 'LK', label: 'Sri Lanka', flag: '🇱🇰', keywords: ['sri lanka', 'sri lankan', 'colombo', 'kandy', 'sinhala', 'ceylon', 'dailymirror.lk', 'sundaytimes.lk'] },
  { code: 'US', label: 'United States', flag: '🇺🇸', keywords: ['united states', 'america', 'american', 'u.s.', 'usa', 'washington', 'new york', 'california', 'texas', 'florida', 'cnn.com', 'foxnews', 'nytimes', 'washingtonpost', 'usatoday'] },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', keywords: ['united kingdom', 'britain', 'british', 'u.k.', 'uk ', 'england', 'london', 'scotland', 'wales', 'bbc.com', 'bbc.co.uk', 'theguardian', 'telegraph.co.uk', 'dailymail.co.uk'] },
];

/**
 * Filter articles by country relevance
 * @param {Array} articles - Array of GDELT articles
 * @param {string} countryCode - Country code to filter by
 * @returns {Array} Filtered articles
 */
export const filterArticlesByCountry = (articles, countryCode) => {
  if (!countryCode || !articles?.length) return articles;
  
  const region = SOURCE_REGIONS.find(r => r.code === countryCode);
  if (!region || !region.keywords?.length) return articles;
  
  const keywords = region.keywords.map(k => k.toLowerCase());
  
  return articles.filter(article => {
    // Check multiple fields for country relevance
    const title = (article.title || '').toLowerCase();
    const url = (article.url || '').toLowerCase();
    const domain = (article.domain || '').toLowerCase();
    const sourceCountry = (article.sourcecountry || '').toLowerCase();
    
    // Direct country code match
    if (sourceCountry === countryCode.toLowerCase()) return true;
    
    // Check if any keyword appears in title, url, or domain
    return keywords.some(keyword => 
      title.includes(keyword) || 
      url.includes(keyword) || 
      domain.includes(keyword)
    );
  });
};

export default {
  searchGdeltArticles,
  fetchDisasterByType,
  fetchDisastersByCountry,
  fetchSouthAsiaDisasters,
  fetchEmergencyAlerts,
  fetchTVMentions,
  filterArticlesByCountry,
  DISASTER_TERMS,
  TIME_SPANS,
  GDELT_DISASTER_TYPES,
  SOURCE_REGIONS,
};
