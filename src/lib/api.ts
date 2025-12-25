// BookOS Backend API Service
import { App, Book, Settings, BookOSState, SecretItem, ApiResponse } from '@/types/bookos';

const API_BASE = 'http://localhost:8080/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Erreur serveur' };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { success: false, error: 'Impossible de contacter le backend' };
  }
}

// ============= État Global =============

export async function fetchState(): Promise<ApiResponse<BookOSState>> {
  return apiCall<BookOSState>('/state');
}

export async function saveState(state: BookOSState): Promise<ApiResponse<void>> {
  return apiCall<void>('/state', {
    method: 'POST',
    body: JSON.stringify(state),
  });
}

// ============= Applications =============

export async function fetchApps(): Promise<ApiResponse<App[]>> {
  return apiCall<App[]>('/apps');
}

export async function createApp(app: Omit<App, 'id'>): Promise<ApiResponse<App>> {
  return apiCall<App>('/apps', {
    method: 'POST',
    body: JSON.stringify(app),
  });
}

export async function updateAppApi(id: string, updates: Partial<App>): Promise<ApiResponse<App>> {
  return apiCall<App>(`/apps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteAppApi(id: string): Promise<ApiResponse<void>> {
  return apiCall<void>(`/apps/${id}`, {
    method: 'DELETE',
  });
}

// ============= Livres =============

export async function fetchBooks(): Promise<ApiResponse<Book[]>> {
  return apiCall<Book[]>('/books');
}

export async function createBook(book: Omit<Book, 'id' | 'addedAt'>): Promise<ApiResponse<Book>> {
  return apiCall<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export async function updateBookApi(id: string, updates: Partial<Book>): Promise<ApiResponse<Book>> {
  return apiCall<Book>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBookApi(id: string): Promise<ApiResponse<void>> {
  return apiCall<void>(`/books/${id}`, {
    method: 'DELETE',
  });
}

// ============= Secrets =============

export async function fetchSecrets(): Promise<ApiResponse<SecretItem[]>> {
  return apiCall<SecretItem[]>('/secrets');
}

export async function createSecret(secret: Omit<SecretItem, 'id'>): Promise<ApiResponse<SecretItem>> {
  return apiCall<SecretItem>('/secrets', {
    method: 'POST',
    body: JSON.stringify(secret),
  });
}

export async function updateSecretApi(id: string, updates: Partial<SecretItem>): Promise<ApiResponse<SecretItem>> {
  return apiCall<SecretItem>(`/secrets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSecretApi(id: string): Promise<ApiResponse<void>> {
  return apiCall<void>(`/secrets/${id}`, {
    method: 'DELETE',
  });
}

// ============= Paramètres =============

export async function fetchSettings(): Promise<ApiResponse<Settings>> {
  return apiCall<Settings>('/settings');
}

export async function updateSettingsApi(updates: Partial<Settings>): Promise<ApiResponse<Settings>> {
  return apiCall<Settings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function verifyLockCode(code: string): Promise<ApiResponse<{ valid: boolean; token?: string }>> {
  return apiCall<{ valid: boolean; token?: string }>('/settings/lock', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// ============= Ouverture de contenus =============

export interface OpenRequest {
  type: 'app' | 'book' | 'secret' | 'url';
  url: string;
  isPath?: boolean;
}

export async function openContent(request: OpenRequest): Promise<ApiResponse<void>> {
  return apiCall<void>('/open', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function openApp(app: App): Promise<ApiResponse<void>> {
  return openContent({
    type: 'app',
    url: app.url,
    isPath: app.isPath,
  });
}

export async function openBook(book: Book, apps: App[]): Promise<ApiResponse<void>> {
  if (book.openWith === 'url' && book.url) {
    return openContent({
      type: 'book',
      url: book.url,
      isPath: false,
    });
  } else if (book.openWith === 'app' && book.appId) {
    const app = apps.find(a => a.id === book.appId);
    if (app) {
      return openContent({
        type: 'book',
        url: app.url,
        isPath: app.isPath,
      });
    }
  }
  return { success: false, error: 'Configuration de livre invalide' };
}

export async function openSecret(secret: SecretItem): Promise<ApiResponse<void>> {
  return openContent({
    type: 'secret',
    url: secret.url,
    isPath: secret.type === 'app',
  });
}

// ============= Exécution de commandes =============

export interface ExecuteCommandRequest {
  command: string;
}

export interface ExecuteCommandResponse {
  success: boolean;
  output?: string;
  error?: string;
}

export async function executeCommand(command: string): Promise<ApiResponse<ExecuteCommandResponse>> {
  return apiCall<ExecuteCommandResponse>('/execute', {
    method: 'POST',
    body: JSON.stringify({ command }),
  });
}

// ============= Upload de fichiers =============

export async function uploadFile(file: File): Promise<ApiResponse<{ id: string; url: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Erreur upload' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, error: 'Impossible de téléverser le fichier' };
  }
}

export function getFileUrl(fileId: string): string {
  return `${API_BASE}/files/${fileId}`;
}
