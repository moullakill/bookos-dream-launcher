import { Book, App } from '@/types/bookos';
import { BookCard } from './BookCard';
import { BookOpen } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  apps: App[];
  onOpenBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
}

export function LibraryView({ books, apps, onOpenBook, onEditBook }: LibraryViewProps) {
  // Sort by last read, then by title
  const sortedBooks = [...books].sort((a, b) => {
    if (a.lastRead && b.lastRead) {
      return new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime();
    }
    if (a.lastRead) return -1;
    if (b.lastRead) return 1;
    return a.title.localeCompare(b.title);
  });

  const currentlyReading = sortedBooks.filter(b => b.progress && b.progress > 0 && b.progress < 100);
  const toRead = sortedBooks.filter(b => !b.progress || b.progress === 0);
  const finished = sortedBooks.filter(b => b.progress === 100);

  const renderSection = (title: string, items: Book[]) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className="font-display text-sm font-medium text-muted-foreground mb-3 px-2">
          {title}
        </h2>
        <div className="grid grid-cols-4 gap-2 justify-items-center">
          {items.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => onOpenBook(book)}
              onEdit={() => onEditBook(book)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
          <BookOpen className="w-12 h-12 opacity-50" />
          <p className="text-center">Votre bibliothèque est vide</p>
          <p className="text-sm">Appuyez sur + pour ajouter un livre</p>
        </div>
      ) : (
        <>
          {renderSection('En cours de lecture', currentlyReading)}
          {renderSection('À lire', toRead)}
          {renderSection('Terminés', finished)}
        </>
      )}
    </div>
  );
}
