import {
  Customer,
  Professional,
  Service,
  Appointment,
  BarbershopSettings
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PROFESSIONALS,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_SETTINGS
} from './mockData';

const STORAGE_KEYS = {
  CUSTOMERS: 'barberflow_customers',
  PROFESSIONALS: 'barberflow_professionals',
  SERVICES: 'barberflow_services',
  APPOINTMENTS: 'barberflow_appointments',
  SETTINGS: 'barberflow_settings',
  INITIALIZED: 'barberflow_initialized_v2',
};

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__bf_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Memory fallback in case localStorage is blocked
const memoryStorage: Record<string, string> = {};

export const storage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      if (isLocalStorageAvailable()) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      const memItem = memoryStorage[key];
      return memItem ? JSON.parse(memItem) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key ${key} from storage:`, e);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      if (isLocalStorageAvailable()) {
        window.localStorage.setItem(key, serialized);
      }
      memoryStorage[key] = serialized;
    } catch (e) {
      console.warn(`Error saving key ${key} to storage:`, e);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch (e) {
      console.warn(`Error removing key ${key}:`, e);
    }
  },
};

// Initialize default data if not present
export const initializeStorage = (): void => {
  const isInitialized = storage.getItem<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (!isInitialized) {
    resetToDefaultDemoData();
  }
};

// Reset all demo data to default state
export const resetToDefaultDemoData = (): void => {
  storage.setItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  storage.setItem<Professional[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
  storage.setItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  storage.setItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  storage.setItem<BarbershopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  storage.setItem<boolean>(STORAGE_KEYS.INITIALIZED, true);
};

export { STORAGE_KEYS };
