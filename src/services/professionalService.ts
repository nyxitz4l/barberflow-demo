import { Professional } from '../types';
import { storage, STORAGE_KEYS, initializeStorage } from './storageService';
import { INITIAL_PROFESSIONALS } from './mockData';

export const professionalService = {
  getAll: (includeInactive = true): Professional[] => {
    initializeStorage();
    const list = storage.getItem<Professional[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
    return includeInactive ? list : list.filter((p) => p.isActive);
  },

  getById: (id: string): Professional | undefined => {
    const list = professionalService.getAll(true);
    return list.find((p) => p.id === id);
  },

  create: (data: Omit<Professional, 'id'>): Professional => {
    const list = professionalService.getAll(true);
    const newProfessional: Professional = {
      ...data,
      id: `pro-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    };
    list.push(newProfessional);
    storage.setItem(STORAGE_KEYS.PROFESSIONALS, list);
    return newProfessional;
  },

  update: (id: string, updates: Partial<Professional>): Professional | null => {
    const list = professionalService.getAll(true);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    storage.setItem(STORAGE_KEYS.PROFESSIONALS, list);
    return updated;
  },

  toggleStatus: (id: string): Professional | null => {
    const pro = professionalService.getById(id);
    if (!pro) return null;
    return professionalService.update(id, { isActive: !pro.isActive });
  },
};
