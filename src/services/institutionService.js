import {
  ALL_NIGERIAN_UNIVERSITIES,
  NIGERIAN_POLYTECHNICS,
  NIGERIAN_COLLEGES_OF_EDUCATION
} from '../data/institutions';

/**
 * Service to manage Nigerian Tertiary Institutions
 * Features:
 * - Complete NUC-accredited dataset (240+ Federal, State & Private universities)
 * - Live synchronization with HipoLabs public university database
 * - Fast multi-field fuzzy search (acronym, name, state, category)
 */

const STORAGE_CACHE_KEY = 'jamb_institutions_cache_v2';

let cachedList = null;

export const loadAllUniversities = async () => {
  if (cachedList && cachedList.length > 0) {
    return cachedList;
  }

  // 1. Try reading from localStorage cache
  try {
    const saved = localStorage.getItem(STORAGE_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= ALL_NIGERIAN_UNIVERSITIES.length) {
        cachedList = parsed;
        return cachedList;
      }
    }
  } catch (e) {}

  // 2. Start with comprehensive built-in NUC list
  const masterList = [...ALL_NIGERIAN_UNIVERSITIES];

  // 3. Attempt live sync from HipoLabs University API in the background
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://universities.hipolabs.com/search?country=Nigeria', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const liveData = await res.json();
      if (Array.isArray(liveData)) {
        liveData.forEach(item => {
          const apiName = (item.name || '').trim();
          if (!apiName) return;

          // Check if already in masterList by partial match
          const exists = masterList.some(
            u => u.name.toLowerCase() === apiName.toLowerCase() ||
                 u.name.toLowerCase().includes(apiName.toLowerCase()) ||
                 apiName.toLowerCase().includes(u.name.toLowerCase())
          );

          if (!exists) {
            masterList.push({
              name: apiName,
              shortName: '',
              type: 'Private', // default designation if unknown
              state: item['state-province'] || 'Nigeria',
              website: item.web_pages?.[0] || ''
            });
          }
        });
      }
    }
  } catch (e) {
    // Graceful offline fallback
    console.info('Live university API unavailable, using comprehensive offline NUC catalog');
  }

  // Sort alphabetically by name
  masterList.sort((a, b) => a.name.localeCompare(b.name));

  cachedList = masterList;
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(masterList));
  } catch (e) {}

  return masterList;
};

/**
 * Filter universities by search query and optional type filter ('All' | 'Federal' | 'State' | 'Private')
 */
export const searchUniversities = (query = '', typeFilter = 'All', list = ALL_NIGERIAN_UNIVERSITIES) => {
  const q = query.trim().toLowerCase();
  return list.filter(item => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    if (!matchesType) return false;

    if (!q) return true;

    const nameMatch = item.name.toLowerCase().includes(q);
    const shortMatch = item.shortName && item.shortName.toLowerCase().includes(q);
    const stateMatch = item.state && item.state.toLowerCase().includes(q);

    return nameMatch || shortMatch || stateMatch;
  });
};

/**
 * Returns plain string array of all university names for easy select options
 */
export const getUniversityNames = (list = ALL_NIGERIAN_UNIVERSITIES) => {
  return list.map(u => u.name);
};
