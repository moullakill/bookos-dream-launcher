import { useState, useEffect, useCallback } from 'react';
import { App, Book, Settings, BookOSState, SecretItem } from '@/types/bookos';
import { toast } from 'sonner';
import * as api from '@/lib/api';

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
  const [isOnline, setIsOnline] = useState(false);

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      const response = await api.fetchState();
      
      if (response.success && response.data) {
        setApps(response.data.apps || defaultApps);
        setBooks(response.data.books || defaultBooks);
        setSettings(response.data.settings || defaultSettings);
        setSecrets(response.data.secrets || []);
        setIsUnlocked(!response.data.settings?.lockCode);
        setIsOnline(true);
      } else {
        // Fallback to localStorage if backend unavailable
        const stored = localStorage.getItem('bookos-state');
        if (stored) {
          const state = JSON.parse(stored);
          setApps(state.apps || defaultApps);
          setBooks(state.books || defaultBooks);
          setSettings(state.settings || defaultSettings);
          setSecrets(state.secrets || []);
          setIsUnlocked(!state.settings?.lockCode);
        }
        setIsOnline(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('bookos-state');
      if (stored) {
        const state = JSON.parse(stored);
        setApps(state.apps || defaultApps);
        setBooks(state.books || defaultBooks);
        setSettings(state.settings || defaultSettings);
        setSecrets(state.secrets || []);
        setIsUnlocked(!state.settings?.lockCode);
      }
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data (to backend and localStorage as backup)
  const saveData = useCallback(async (state: BookOSState) => {
    // Always save to localStorage as backup
    localStorage.setItem('bookos-state', JSON.stringify(state));
    
    // Try to save to backend
    if (isOnline) {
      const response = await api.saveState(state);
      if (!response.success) {
        console.warn('Failed to save to backend, using localStorage');
      }
    }
  }, [isOnline]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoading) {
      saveData({ apps, books, settings, secrets });
    }
  }, [apps, books, settings, secrets, isLoading, saveData]);

  // ============= App Management =============

  const addApp = useCallback(async (app: Omit<App, 'id'>) => {
    if (isOnline) {
      const response = await api.createApp(app);
      if (response.success && response.data) {
        setApps(prev => [...prev, response.data!]);
        toast.success('Application ajoutée');
        return;
      }
    }
    // Fallback to local
    const newApp = { ...app, id: Date.now().toString() };
    setApps(prev => [...prev, newApp]);
    toast.success('Application ajoutée (mode hors-ligne)');
  }, [isOnline]);

  const updateApp = useCallback(async (id: string, updates: Partial<App>) => {
    if (isOnline) {
      const response = await api.updateAppApi(id, updates);
      if (response.success) {
        setApps(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
        return;
      }
    }
    // Fallback to local
    setApps(prev => prev.map(app => app.id === id ? { ...app, ...updates } : app));
  }, [isOnline]);

  const deleteApp = useCallback(async (id: string) => {
    if (isOnline) {
      const response = await api.deleteAppApi(id);
      if (response.success) {
        setApps(prev => prev.filter(app => app.id !== id));
        toast.success('Application supprimée');
        return;
      }
    }
    // Fallback to local
    setApps(prev => prev.filter(app => app.id !== id));
    toast.success('Application supprimée (mode hors-ligne)');
  }, [isOnline]);

  const openApp = useCallback(async (app: App) => {
    const response = await api.openApp(app);
    if (!response.success) {
      toast.error(response.error || 'Impossible d\'ouvrir l\'application');
    }
  }, []);

  // ============= Book Management =============

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'addedAt'>) => {
    if (isOnline) {
      const response = await api.createBook(book);
      if (response.success && response.data) {
        setBooks(prev => [...prev, response.data!]);
        toast.success('Livre ajouté');
        return;
      }
    }
    // Fallback to local
    const newBook = { ...book, id: Date.now().toString(), addedAt: new Date().toISOString() };
    setBooks(prev => [...prev, newBook]);
    toast.success('Livre ajouté (mode hors-ligne)');
  }, [isOnline]);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    if (isOnline) {
      const response = await api.updateBookApi(id, updates);
      if (response.success) {
        setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
        return;
      }
    }
    // Fallback to local
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  }, [isOnline]);

  const deleteBook = useCallback(async (id: string) => {
    if (isOnline) {
      const response = await api.deleteBookApi(id);
      if (response.success) {
        setBooks(prev => prev.filter(book => book.id !== id));
        toast.success('Livre supprimé');
        return;
      }
    }
    // Fallback to local
    setBooks(prev => prev.filter(book => book.id !== id));
    toast.success('Livre supprimé (mode hors-ligne)');
  }, [isOnline]);

  const openBook = useCallback(async (book: Book) => {
    // Update lastRead first
    await updateBook(book.id, { lastRead: new Date().toISOString() });
    
    // Then open via backend
    const response = await api.openBook(book, apps);
    if (!response.success) {
      toast.error(response.error || 'Impossible d\'ouvrir le livre');
    }
  }, [apps, updateBook]);

  // ============= Settings Management =============

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    if (isOnline) {
      const response = await api.updateSettingsApi(updates);
      if (response.success) {
        setSettings(prev => ({ ...prev, ...updates }));
        return;
      }
    }
    // Fallback to local
    setSettings(prev => ({ ...prev, ...updates }));
  }, [isOnline]);

  const setLockCode = useCallback(async (code: string | undefined) => {
    await updateSettings({ lockCode: code, isLocked: !!code });
    if (!code) setIsUnlocked(true);
  }, [updateSettings]);

  const unlock = useCallback(async (code: string): Promise<boolean> => {
    if (isOnline) {
      const response = await api.verifyLockCode(code);
      if (response.success && response.data?.valid) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    }
    // Fallback to local check
    if (code === settings.lockCode) {
      setIsUnlocked(true);
      return true;
    }
    return false;
  }, [settings.lockCode, isOnline]);

  const lock = useCallback(() => {
    if (settings.lockCode) {
      setIsUnlocked(false);
    }
  }, [settings.lockCode]);

  // ============= Secret Management =============

  const addSecret = useCallback(async (secret: Omit<SecretItem, 'id'>) => {
    if (isOnline) {
      const response = await api.createSecret(secret);
      if (response.success && response.data) {
        setSecrets(prev => [...prev, response.data!]);
        toast.success('Secret ajouté');
        return;
      }
    }
    // Fallback to local
    const newSecret = { ...secret, id: Date.now().toString() };
    setSecrets(prev => [...prev, newSecret]);
    toast.success('Secret ajouté (mode hors-ligne)');
  }, [isOnline]);

  const updateSecret = useCallback(async (id: string, updates: Partial<SecretItem>) => {
    if (isOnline) {
      const response = await api.updateSecretApi(id, updates);
      if (response.success) {
        setSecrets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        return;
      }
    }
    // Fallback to local
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [isOnline]);

  const deleteSecret = useCallback(async (id: string) => {
    if (isOnline) {
      const response = await api.deleteSecretApi(id);
      if (response.success) {
        setSecrets(prev => prev.filter(s => s.id !== id));
        toast.success('Secret supprimé');
        return;
      }
    }
    // Fallback to local
    setSecrets(prev => prev.filter(s => s.id !== id));
    toast.success('Secret supprimé (mode hors-ligne)');
  }, [isOnline]);

  const openSecretItem = useCallback(async (secret: SecretItem) => {
    const response = await api.openSecret(secret);
    if (!response.success) {
      toast.error(response.error || 'Impossible d\'ouvrir le secret');
    }
  }, []);

  return {
    apps,
    books,
    settings,
    secrets,
    isLoading,
    isUnlocked,
    isOnline,
    addApp,
    updateApp,
    deleteApp,
    openApp,
    addBook,
    updateBook,
    deleteBook,
    openBook,
    updateSettings,
    setLockCode,
    unlock,
    lock,
    addSecret,
    updateSecret,
    deleteSecret,
    openSecretItem,
  };
}
