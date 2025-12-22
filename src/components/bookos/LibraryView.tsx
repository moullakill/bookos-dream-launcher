import { useState, useMemo } from 'react';
import { Book, App } from '@/types/bookos';
import { BookCard } from './BookCard';
import { BookOpen, Search, SortAsc, SortDesc, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface LibraryViewProps {
  books: Book[];
  apps: App[];
  onOpenBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  cardSize?: number;
}

type SortField = 'title' | 'author' | 'progress' | 'addedAt' | 'lastRead';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'reading' | 'toRead' | 'finished';

export function LibraryView({ books, apps, onOpenBook, onEditBook, cardSize = 80 }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('lastRead');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showSearch, setShowSearch] = useState(false);

  // Get unique authors for filtering
  const authors = useMemo(() => {
    const authorSet = new Set(books.map(b => b.author).filter(Boolean));
    return Array.from(authorSet).sort();
  }, [books]);

  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
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
    if (selectedAuthors.length > 0) {
      result = result.filter(b => selectedAuthors.includes(b.author));
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
        case 'progress':
          comparison = (a.progress ?? 0) - (b.progress ?? 0);
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'lastRead':
          const aTime = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          const bTime = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          comparison = aTime - bTime;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [books, searchQuery, sortField, sortOrder, statusFilter, selectedAuthors]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author)
        : [...prev, author]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedAuthors([]);
    setSortField('lastRead');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || selectedAuthors.length > 0;

  const sortLabels: Record<SortField, string> = {
    title: 'Titre',
    author: 'Auteur',
    progress: 'Progression',
    addedAt: 'Date d\'ajout',
    lastRead: 'Dernière lecture',
  };

  const statusLabels: Record<StatusFilter, string> = {
    all: 'Tous',
    reading: 'En cours',
    toRead: 'À lire',
    finished: 'Terminés',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
        {/* Search */}
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Rechercher un livre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                  {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                  {sortLabels[sortField]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(sortLabels).map(([field, label]) => (
                  <DropdownMenuItem
                    key={field}
                    onClick={() => setSortField(field as SortField)}
                    className={sortField === field ? 'bg-accent' : ''}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleSortOrder}>
                  {sortOrder === 'asc' ? 'Décroissant' : 'Croissant'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={hasActiveFilters ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-8 gap-1 text-xs"
                >
                  <Filter className="h-3 w-3" />
                  Filtrer
                  {hasActiveFilters && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                      {(statusFilter !== 'all' ? 1 : 0) + selectedAuthors.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status as StatusFilter)}
                    className={statusFilter === status ? 'bg-accent' : ''}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
                
                {authors.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Auteurs</DropdownMenuLabel>
                    {authors.map(author => (
                      <DropdownMenuCheckboxItem
                        key={author}
                        checked={selectedAuthors.includes(author)}
                        onCheckedChange={() => toggleAuthor(author)}
                      >
                        {author}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
                
                {hasActiveFilters && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                      Réinitialiser les filtres
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />
            
            <span className="text-xs text-muted-foreground">
              {filteredAndSortedBooks.length} livre{filteredAndSortedBooks.length > 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {/* Books grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <BookOpen className="w-12 h-12 opacity-50" />
            <p className="text-center">Votre bibliothèque est vide</p>
            <p className="text-sm">Appuyez sur + pour ajouter un livre</p>
          </div>
        ) : filteredAndSortedBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Search className="w-12 h-12 opacity-50" />
            <p className="text-center">Aucun livre trouvé</p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 justify-items-center">
            {filteredAndSortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onOpenBook(book)}
                onEdit={() => onEditBook(book)}
                cardSize={cardSize}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
