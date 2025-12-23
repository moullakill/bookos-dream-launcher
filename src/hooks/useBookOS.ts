import { useState, useEffect, useCallback } from 'react';
import { App, Book, Settings, BookOSState, SecretItem } from '@/types/bookos';

const API_BASE = 'http://localhost:8080/api';

const defaultSettings: Settings = {
  theme: 'paper',
  backgroundBlur: 8,
  appIconSize: 64,
  bookCardSize: 80,
  isLocked: false,
};

const defaultApps: App[] = [
  { id: '1', name: 'Kindle', url: 'https://read.amazon.com', icon: '📚', isPath: false },
  { id: '2', name: 'Calibre', url: '/calibre', icon: '📖', isPath: true },
  { id: '3', name: 'Pocket', url: 'https://getpocket.com', icon: '📌', isPath: false },
];

const defaultBooks: Book[] = [
  { 
    id: '1', 
    title: '1984', 
    author: 'George Orwell', 
    cover: '', 
    openWith: 'url', 
    url: 'https://example.com/1984',
    progress: 45,
    addedAt: new Date().toISOString()
  },
];

export function useBookOS() {
  const [apps, setApps] = useState<App[]>(defaultApps);
  const [books, setBooks] = useState<Book[]>(defaultBooks);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      // Try to fetch from backend, fallback to localStorage
      const stored = localStorage.getItem('bookos-state');
      if (stored) {
        const state = JSON.parse(stored);
        setApps(state.apps || defaultApps);
        setBooks(state.books || defaultBooks);
        setSettings(state.settings || defaultSettings);
        setSecrets(state.secrets || []);
        setIsUnlocked(!state.settings?.lockCode);
      }
    } catch (error) {
      console.log('Using default data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to backend
  const saveData = useCallback(async (state: BookOSState) => {
    try {
      localStorage.setItem('bookos-state', JSON.stringify(state));
      // In production, also save to backend:
      // await fetch(`${API_BASE}/state`, { method: 'POST', body: JSON.stringify(state) });
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoading) {
      saveData({ apps, books, settings, secrets });
    }
  }, [apps, books, settings, secrets, isLoading, saveData]);

  // App management
  const addApp = useCallback((app: Omit<App, 'id'>) => {
    const newApp = { ...app, id: Date.now().toString() };
    setApps(prev => [...prev, newApp]);
  }, []);

  const updateApp = useCallback((id: string, updates: Partial<App>) => {
    setApps(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  }, []);

  const deleteApp = useCallback((id: string) => {
    setApps(prev => prev.filter(app => app.id !== id));
  }, []);

  // Book management
  const addBook = useCallback((book: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook = { ...book, id: Date.now().toString(), addedAt: new Date().toISOString() };
    setBooks(prev => [...prev, newBook]);
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  }, []);

  // Settings management
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const setLockCode = useCallback((code: string | undefined) => {
    updateSettings({ lockCode: code, isLocked: !!code });
    if (!code) setIsUnlocked(true);
  }, [updateSettings]);

  const unlock = useCallback((code: string): boolean => {
    if (code === settings.lockCode) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, [settings.lockCode]);

  const lock = useCallback(() => {
    if (settings.lockCode) {
      setIsUnlocked(false);
    }
  }, [settings.lockCode]);

  // Secret management
  const addSecret = useCallback((secret: Omit<SecretItem, 'id'>) => {
    const newSecret = { ...secret, id: Date.now().toString() };
    setSecrets(prev => [...prev, newSecret]);
  }, []);

  const deleteSecret = useCallback((id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    apps,
    books,
    settings,
    secrets,
    isLoading,
    isUnlocked,
    addApp,
    updateApp,
    deleteApp,
    addBook,
    updateBook,
    deleteBook,
    updateSettings,
    setLockCode,
    unlock,
    lock,
    addSecret,
    deleteSecret,
  };
}
