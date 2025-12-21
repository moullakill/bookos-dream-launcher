import { Book } from '@/types/bookos';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onEdit?: () => void;
  cardSize?: number; // width in pixels
}

export function BookCard({ book, onClick, onEdit, cardSize = 80 }: BookCardProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.();
  };

  // Calculate height with book ratio (1:1.4)
  const cardHeight = Math.round(cardSize * 1.4);
  const iconSize = Math.round(cardSize * 0.4);

  return (
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className="group flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div 
        className="relative rounded-lg overflow-hidden shadow-icon group-hover:shadow-icon-hover transition-shadow duration-300"
        style={{ width: cardSize, height: cardHeight }}
      >
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <BookOpen style={{ width: iconSize, height: iconSize }} className="text-primary/60" />
          </div>
        )}
        {book.progress !== undefined && book.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="text-center" style={{ maxWidth: cardSize + 16 }}>
        <p className="text-xs font-medium text-foreground truncate">{book.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{book.author}</p>
      </div>
    </button>
  );
}
