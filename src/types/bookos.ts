export interface App {
  id: string;
  name: string;
  url: string;
  icon: string;
  isPath: boolean; // true if it's a local path, false if URL
  category?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  openWith: 'url' | 'app';
  url?: string;
  appId?: string;
  progress?: number;
  lastRead?: string;
  addedAt: string;
}

export interface Theme {
  id: string;
  name: string;
  className: string;
  preview: {
    bg: string;
    accent: string;
    text: string;
  };
}

export interface Settings {
  theme: string;
  backgroundImage?: string;
  backgroundBlur: number; // 0-20
  appIconSize: number; // 48-96
  bookCardSize: number; // 60-120
  lockCode?: string;
  isLocked: boolean;
}

export interface BookOSState {
  apps: App[];
  books: Book[];
  settings: Settings;
}

// Backend API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
