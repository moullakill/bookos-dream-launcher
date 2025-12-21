import { useState, forwardRef } from 'react';
import { Book, App } from '@/types/bookos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookFormProps {
  book?: Book;
  apps: App[];
  onSave: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

// Custom Select components to fix ref warning
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
        <ChevronUp className="h-4 w-4" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export function BookForm({ book, apps, onSave, onDelete, onCancel }: BookFormProps) {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [cover, setCover] = useState(book?.cover || '');
  const [openWith, setOpenWith] = useState<'url' | 'app'>(book?.openWith || 'url');
  const [url, setUrl] = useState(book?.url || '');
  const [appId, setAppId] = useState(book?.appId || '');
  const [progress, setProgress] = useState(book?.progress || 0);

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
        progress,
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
        {cover && (
          <div className="flex justify-center">
            <img 
              src={cover} 
              alt="Preview couverture"
              className="h-24 object-contain rounded shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {book && (
        <div className="space-y-2">
          <Label>Progression: {progress}%</Label>
          <Slider
            value={[progress]}
            onValueChange={(v) => setProgress(v[0])}
            max={100}
            step={1}
          />
        </div>
      )}

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
