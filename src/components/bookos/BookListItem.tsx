import { Book } from '@/types/bookos';
import { BookOpen, Star } from 'lucide-react';

interface BookListItemProps {
  book: Book;
  onClick: () => void;
  onEdit?: () => void;
}

export function BookListItem({ book, onClick, onEdit }: BookListItemProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.();
  };

  return (
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-secondary/50 text-left"
    >
      {/* Cover */}
      <div className="w-12 h-16 rounded overflow-hidden shadow-sm flex-shrink-0">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{book.title}</p>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        {book.genre && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{book.genre}</p>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {book.rating && book.rating > 0 && (
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{book.rating}</span>
          </div>
        )}
        {book.progress !== undefined && book.progress > 0 && (
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
