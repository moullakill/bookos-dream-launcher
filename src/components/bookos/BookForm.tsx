import { useState } from 'react';
import { Book, App } from '@/types/bookos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookFormProps {
  book?: Book;
  apps: App[];
  onSave: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function BookForm({ book, apps, onSave, onDelete, onCancel }: BookFormProps) {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [cover, setCover] = useState(book?.cover || '');
  const [openWith, setOpenWith] = useState<'url' | 'app'>(book?.openWith || 'url');
  const [url, setUrl] = useState(book?.url || '');
  const [appId, setAppId] = useState(book?.appId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && author) {
      onSave({
        title,
        author,
        cover: cover || undefined,
        openWith,
        url: openWith === 'url' ? url : undefined,
        appId: openWith === 'app' ? appId : undefined,
        progress: book?.progress,
        lastRead: book?.lastRead,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du livre</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: 1984"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Auteur</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Ex: George Orwell"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover">URL de la couverture (optionnel)</Label>
        <Input
          id="cover"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Ouvrir avec</Label>
        <Select value={openWith} onValueChange={(v) => setOpenWith(v as 'url' | 'app')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="url">URL</SelectItem>
            <SelectItem value="app">Application</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {openWith === 'url' ? (
        <div className="space-y-2">
          <Label htmlFor="url">URL du livre</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Application</Label>
          <Select value={appId} onValueChange={setAppId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une application" />
            </SelectTrigger>
            <SelectContent>
              {apps.map((app) => (
                <SelectItem key={app.id} value={app.id}>
                  {app.icon} {app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} className="flex-1">
            Supprimer
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {book ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
