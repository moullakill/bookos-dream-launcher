// Super Apps Registry
// Super apps are modular plugins that open as BookOS components

import { TextEditor } from './TextEditor';

export interface SuperAppDefinition {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<SuperAppProps>;
  description: string;
}

export interface SuperAppProps {
  onClose: () => void;
}

export interface TextDocument {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Registry of all available super apps
export const superApps: SuperAppDefinition[] = [
  {
    id: 'text-editor',
    name: 'Éditeur',
    icon: 'FileText',
    component: TextEditor,
    description: 'Éditeur de texte riche avec sauvegarde',
  },
];

export function getSuperApp(id: string): SuperAppDefinition | undefined {
  return superApps.find(app => app.id === id);
}

export function isSuperApp(appId: string): boolean {
  return appId.startsWith('superapp:');
}

export function getSuperAppId(appId: string): string {
  return appId.replace('superapp:', '');
}
