import { useState } from 'react';
import { Book, App, BookSortField, BookSortOrder, BookViewMode, BookGroupBy } from '@/types/bookos';
import { BookCard } from './BookCard';
import { BookListItem } from './BookListItem';
import { BookSortControls } from './BookSortControls';
import { BookOpen, Star } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  apps: App[];
  onOpenBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  cardSize?: number;
}

export function LibraryView({ books, apps, onOpenBook, onEditBook, cardSize = 80 }: LibraryViewProps) {
  const [sortField, setSortField] = useState<BookSortField>('lastRead');
  const [sortOrder, setSortOrder] = useState<BookSortOrder>('desc');
  const [viewMode, setViewMode] = useState<BookViewMode>('grid');
  const [groupBy, setGroupBy] = useState<BookGroupBy>('status');

  const sortBooks = (booksToSort: Book[]): Book[] => {
    return [...booksToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'lastRead':
          const aTime = a.lastRead ? new Date(a.lastRead).getTime() : 0;
          const bTime = b.lastRead ? new Date(b.lastRead).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const groupBooks = (booksToGroup: Book[]): { title: string; books: Book[] }[] => {
    const sorted = sortBooks(booksToGroup);
    
    if (groupBy === 'none') {
      return [{ title: 'Tous les livres', books: sorted }];
    }

    const groups: Record<string, Book[]> = {};
    
    sorted.forEach(book => {
      let key: string;
      
      switch (groupBy) {
        case 'status':
          if (book.progress === 100) key = 'Terminés';
          else if (book.progress && book.progress > 0) key = 'En cours';
          else key = 'À lire';
          break;
        case 'genre':
          key = book.genre || 'Sans genre';
          break;
        case 'author':
          key = book.author || 'Auteur inconnu';
          break;
        case 'rating':
          if (!book.rating || book.rating === 0) key = 'Non noté';
          else key = `${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}`;
          break;
        default:
          key = 'Autres';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(book);
    });

    // Sort groups logically
    const groupOrder = groupBy === 'status' 
      ? ['En cours', 'À lire', 'Terminés']
      : groupBy === 'rating'
      ? ['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆', '★☆☆☆☆', 'Non noté']
      : Object.keys(groups).sort();

    return groupOrder
      .filter(key => groups[key]?.length > 0)
      .map(title => ({ title, books: groups[title] }));
  };

  const handleSortChange = (field: BookSortField, order: BookSortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const groupedBooks = groupBooks(books);

  const renderBookItem = (book: Book) => {
    if (viewMode === 'list') {
      return (
        <BookListItem
          key={book.id}
          book={book}
          onClick={() => onOpenBook(book)}
          onEdit={() => onEditBook(book)}
        />
      );
    }
    return (
      <BookCard
        key={book.id}
        book={book}
        onClick={() => onOpenBook(book)}
        onEdit={() => onEditBook(book)}
        cardSize={cardSize}
      />
    );
  };

  const renderSection = (title: string, items: Book[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="font-display text-sm font-medium text-muted-foreground mb-3 px-2 flex items-center gap-2">
          {title}
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{items.length}</span>
        </h2>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2 justify-items-center">
            {items.map(renderBookItem)}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map(renderBookItem)}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <BookSortControls
        sortField={sortField}
        sortOrder={sortOrder}
        viewMode={viewMode}
        groupBy={groupBy}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onGroupByChange={setGroupBy}
      />
      
      <div className="flex-1 p-4 overflow-y-auto">
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <BookOpen className="w-12 h-12 opacity-50" />
            <p className="text-center">Votre bibliothèque est vide</p>
            <p className="text-sm">Appuyez sur + pour ajouter un livre</p>
          </div>
        ) : (
          groupedBooks.map(group => renderSection(group.title, group.books))
        )}
      </div>
    </div>
  );
}
