import { BarbershopSettings } from '../types';
import { storage, STORAGE_KEYS, initializeStorage, resetToDefaultDemoData } from './storageService';
import { INITIAL_SETTINGS } from './mockData';

export const settingsService = {
  get: (): BarbershopSettings => {
    initializeStorage();
    return storage.getItem<BarbershopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  update: (updates: Partial<BarbershopSettings>): BarbershopSettings => {
    const current = settingsService.get();
    const updated = { ...current, ...updates };
    storage.setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  restoreDemoData: (): void => {
    resetToDefaultDemoData();
  },
};
