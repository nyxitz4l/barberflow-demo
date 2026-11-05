import { Customer } from '../types';
import { storage, STORAGE_KEYS, initializeStorage } from './storageService';
import { INITIAL_CUSTOMERS } from './mockData';

export const customerService = {
  getAll: (): Customer[] => {
    initializeStorage();
    return storage.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  getById: (id: string): Customer | undefined => {
    const list = customerService.getAll();
    return list.find((c) => c.id === id);
  },

  create: (data: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent' | 'lastVisitDate'>): Customer => {
    const list = customerService.getAll();
    const newCustomer: Customer = {
      ...data,
      id: `cus-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      totalVisits: 0,
      totalSpent: 0,
      lastVisitDate: null,
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newCustomer);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, list);
    return newCustomer;
  },

  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const list = customerService.getAll();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    storage.setItem(STORAGE_KEYS.CUSTOMERS, list);
    return updated;
  },

  delete: (id: string): boolean => {
    const list = customerService.getAll();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === list.length) return false;
    storage.setItem(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  },

  // Records a completed appointment visit for customer statistics
  recordVisit: (customerId: string, amount: number, visitDate: string): void => {
    const customer = customerService.getById(customerId);
    if (!customer) return;
    customerService.update(customerId, {
      totalVisits: customer.totalVisits + 1,
      totalSpent: customer.totalSpent + amount,
      lastVisitDate: visitDate,
    });
  },
};
