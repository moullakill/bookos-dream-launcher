import { useState, useMemo } from 'react';
import { Book, App } from '@/types/bookos';
import { BookCard } from './BookCard';
import { BookOpen, Search, SortAsc, SortDesc, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LibraryViewProps {
  books: Book[];
  apps: App[];
  onOpenBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  cardSize?: number;
}

type SortField = 'title' | 'author' | 'lastRead' | 'progress' | 'addedAt';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'sections';
type StatusFilter = 'all' | 'reading' | 'toRead' | 'finished';

export function LibraryView({ books, apps, onOpenBook, onEditBook, cardSize = 80 }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastRead');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);

  // Get unique authors
  const uniqueAuthors = useMemo(() => {
    const authors = new Set(books.map(b => b.author).filter(Boolean));
    return Array.from(authors).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(query) || 
             b.author.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(b => {
        const progress = b.progress ?? 0;
        switch (statusFilter) {
          case 'reading': return progress > 0 && progress < 100;
          case 'toRead': return progress === 0;
          case 'finished': return progress === 100;
          default: return true;
        }
      });
    }

    // Author filter
    if (authorFilter.length > 0) {
      result = result.filter(b => authorFilter.includes(b.author));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'lastRead':
          const dateA = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          const dateB = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'progress':
          comparison = (a.progress ?? 0) - (b.progress ?? 0);
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, searchQuery, sortField, sortOrder, statusFilter, authorFilter]);

  // Categorize for section view
  const categorizedBooks = useMemo(() => {
    const reading = filteredBooks.filter(b => (b.progress ?? 0) > 0 && (b.progress ?? 0) < 100);
    const toRead = filteredBooks.filter(b => (b.progress ?? 0) === 0);
    const finished = filteredBooks.filter(b => b.progress === 100);
    return { reading, toRead, finished };
  }, [filteredBooks]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const toggleAuthorFilter = (author: string) => {
    setAuthorFilter(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author)
        : [...prev, author]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setAuthorFilter([]);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || authorFilter.length > 0;

  const renderBookGrid = (items: Book[]) => (
    <div className="grid grid-cols-4 gap-2 justify-items-center">
      {items.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onOpenBook(book)}
          onEdit={() => onEditBook(book)}
          cardSize={cardSize}
        />
      ))}
    </div>
  );

  const renderSection = (title: string, items: Book[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="font-display text-sm font-medium text-muted-foreground mb-3 px-2">
          {title} ({items.length})
        </h2>
        {renderBookGrid(items)}
      </section>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-border space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 h-9"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="reading">En cours</SelectItem>
              <SelectItem value="toRead">À lire</SelectItem>
              <SelectItem value="finished">Terminés</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort field */}
          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastRead">Dernière lecture</SelectItem>
              <SelectItem value="title">Titre</SelectItem>
              <SelectItem value="author">Auteur</SelectItem>
              <SelectItem value="progress">Progression</SelectItem>
              <SelectItem value="addedAt">Date d'ajout</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>

          {/* Author filter */}
          {uniqueAuthors.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={authorFilter.length > 0 ? "secondary" : "ghost"} 
                  size="sm" 
                  className="h-8 text-xs"
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Auteurs {authorFilter.length > 0 && `(${authorFilter.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueAuthors.map(author => (
                    <div key={author} className="flex items-center gap-2">
                      <Checkbox
                        id={`author-${author}`}
                        checked={authorFilter.includes(author)}
                        onCheckedChange={() => toggleAuthorFilter(author)}
                      />
                      <Label htmlFor={`author-${author}`} className="text-sm cursor-pointer">
                        {author}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* View mode toggle */}
          <div className="flex-1" />
          <Button
            variant={viewMode === 'sections' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setViewMode(viewMode === 'sections' ? 'grid' : 'sections')}
          >
            {viewMode === 'sections' ? 'Sections' : 'Grille'}
          </Button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clearFilters}>
              <X className="w-3 h-3 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Book list */}
      <div className="flex-1 p-4 overflow-y-auto">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <BookOpen className="w-12 h-12 opacity-50" />
            <p className="text-center">Votre bibliothèque est vide</p>
            <p className="text-sm">Appuyez sur + pour ajouter un livre</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Search className="w-12 h-12 opacity-50" />
            <p className="text-center">Aucun résultat</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>
        ) : viewMode === 'sections' ? (
          <>
            {renderSection('En cours de lecture', categorizedBooks.reading)}
            {renderSection('À lire', categorizedBooks.toRead)}
            {renderSection('Terminés', categorizedBooks.finished)}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3 px-2">
              {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''}
            </p>
            {renderBookGrid(filteredBooks)}
          </>
        )}
      </div>
    </div>
  );
}
