import { Service } from '../types';
import { storage, STORAGE_KEYS, initializeStorage } from './storageService';
import { INITIAL_SERVICES } from './mockData';

export const serviceService = {
  getAll: (includeInactive = true): Service[] => {
    initializeStorage();
    const list = storage.getItem<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    return includeInactive ? list : list.filter((s) => s.isActive);
  },

  getById: (id: string): Service | undefined => {
    const list = serviceService.getAll(true);
    return list.find((s) => s.id === id);
  },

  create: (data: Omit<Service, 'id'>): Service => {
    const list = serviceService.getAll(true);
    const newService: Service = {
      ...data,
      id: `srv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    };
    list.push(newService);
    storage.setItem(STORAGE_KEYS.SERVICES, list);
    return newService;
  },

  update: (id: string, updates: Partial<Service>): Service | null => {
    const list = serviceService.getAll(true);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    storage.setItem(STORAGE_KEYS.SERVICES, list);
    return updated;
  },

  delete: (id: string): boolean => {
    const list = serviceService.getAll(true);
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length === list.length) return false;
    storage.setItem(STORAGE_KEYS.SERVICES, filtered);
    return true;
  },

  toggleStatus: (id: string): Service | null => {
    const srv = serviceService.getById(id);
    if (!srv) return null;
    return serviceService.update(id, { isActive: !srv.isActive });
  },
};
