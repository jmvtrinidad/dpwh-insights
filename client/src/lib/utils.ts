import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Debounce utility function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// URL parameter management utilities for dashboard state
export interface FilterState {
  search: string;
  region: string;
  implementingOffice: string;
  contractor: string;
  status: string;
  year: string;
  province: string;
  municipality: string;
  barangay: string;
}

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  region: '__all__',
  implementingOffice: '__all__',
  contractor: '__all__',
  status: 'Completed',
  year: '__all__',
  province: '__all__',
  municipality: '__all__',
  barangay: '__all__'
};

// URL parameter mapping for clean URLs
const URL_PARAM_MAP = {
  search: 'search',
  region: 'region',
  implementingOffice: 'office',
  contractor: 'contractor',
  status: 'status',
  year: 'year',
  province: 'province',
  municipality: 'municipality',
  barangay: 'barangay',
  tab: 'tab'
} as const;

/**
 * Parse URL search parameters into filter state and active tab
 */
export function parseUrlParams(search: string): { filters: FilterState; activeTab: string } {
  const params = new URLSearchParams(search);
  
  // Handle backward compatibility for implementingOffice parameter
  // Accept both "office" (current) and "implementingOffice" (legacy) parameter names
  const getImplementingOffice = () => {
    return params.get(URL_PARAM_MAP.implementingOffice) || 
           params.get('implementingOffice') || 
           DEFAULT_FILTER_STATE.implementingOffice;
  };
  
  const filters: FilterState = {
    search: params.get(URL_PARAM_MAP.search) || DEFAULT_FILTER_STATE.search,
    region: params.get(URL_PARAM_MAP.region) || DEFAULT_FILTER_STATE.region,
    implementingOffice: getImplementingOffice(),
    contractor: params.get(URL_PARAM_MAP.contractor) || DEFAULT_FILTER_STATE.contractor,
    status: params.get(URL_PARAM_MAP.status) || DEFAULT_FILTER_STATE.status,
    year: params.get(URL_PARAM_MAP.year) || DEFAULT_FILTER_STATE.year,
    province: params.get(URL_PARAM_MAP.province) || DEFAULT_FILTER_STATE.province,
    municipality: params.get(URL_PARAM_MAP.municipality) || DEFAULT_FILTER_STATE.municipality,
    barangay: params.get(URL_PARAM_MAP.barangay) || DEFAULT_FILTER_STATE.barangay
  };
  
  const activeTab = params.get(URL_PARAM_MAP.tab) || 'analytics';
  
  return { filters, activeTab };
}

/**
 * Build URL search parameters from filter state and active tab
 */
export function buildUrlParams(filters: FilterState, activeTab: string): string {
  const params = new URLSearchParams();
  
  // Only add parameters that differ from defaults to keep URLs clean
  if (filters.search && filters.search.trim() !== '') {
    params.set(URL_PARAM_MAP.search, filters.search);
  }
  
  if (filters.region !== DEFAULT_FILTER_STATE.region) {
    params.set(URL_PARAM_MAP.region, filters.region);
  }
  
  if (filters.implementingOffice !== DEFAULT_FILTER_STATE.implementingOffice) {
    params.set(URL_PARAM_MAP.implementingOffice, filters.implementingOffice);
  }
  
  if (filters.contractor !== DEFAULT_FILTER_STATE.contractor) {
    params.set(URL_PARAM_MAP.contractor, filters.contractor);
  }
  
  if (filters.status !== DEFAULT_FILTER_STATE.status) {
    params.set(URL_PARAM_MAP.status, filters.status);
  }
  
  if (filters.year !== DEFAULT_FILTER_STATE.year) {
    params.set(URL_PARAM_MAP.year, filters.year);
  }
  
  if (filters.province !== DEFAULT_FILTER_STATE.province) {
    params.set(URL_PARAM_MAP.province, filters.province);
  }
  
  if (filters.municipality !== DEFAULT_FILTER_STATE.municipality) {
    params.set(URL_PARAM_MAP.municipality, filters.municipality);
  }
  
  if (filters.barangay !== DEFAULT_FILTER_STATE.barangay) {
    params.set(URL_PARAM_MAP.barangay, filters.barangay);
  }
  
  if (activeTab !== 'analytics') {
    params.set(URL_PARAM_MAP.tab, activeTab);
  }
  
  return params.toString();
}

/**
 * Update browser URL without adding to history
 */
export function updateUrlWithState(filters: FilterState, activeTab: string): void {
  const newSearch = buildUrlParams(filters, activeTab);
  const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
  
  // Use replaceState to avoid cluttering browser history
  window.history.replaceState(null, '', newUrl);
}

/**
 * Create debounced version of URL update specifically for search parameter
 * This reduces the number of URL updates during typing
 */
export const debouncedUpdateUrlForSearch = debounce((filters: FilterState, activeTab: string) => {
  updateUrlWithState(filters, activeTab);
}, 300);

/**
 * Immediate URL update for non-search filters and tab changes
 */
export function updateUrlImmediately(filters: FilterState, activeTab: string): void {
  updateUrlWithState(filters, activeTab);
}
