'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppData } from '@/lib/types';
import { loadData, saveData, resetData } from '@/lib/storage';

interface AppContextType {
  data: AppData;
  updateData: (newData: AppData) => void;
  resetAppData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const updateData = useCallback((newData: AppData) => { saveData(newData); setData({ ...newData }); }, []);
  const resetAppData = useCallback(() => { setData(resetData()); }, []);
  return <AppContext.Provider value={{ data, updateData, resetAppData }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
