import { BookSortField, BookSortOrder, BookViewMode, BookGroupBy } from '@/types/bookos';
import { ArrowUpDown, Grid3X3, List, FolderOpen, Star, BookOpen, User, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookSortControlsProps {
  sortField: BookSortField;
  sortOrder: BookSortOrder;
  viewMode: BookViewMode;
  groupBy: BookGroupBy;
  onSortChange: (field: BookSortField, order: BookSortOrder) => void;
  onViewModeChange: (mode: BookViewMode) => void;
  onGroupByChange: (groupBy: BookGroupBy) => void;
}

const sortOptions: { field: BookSortField; label: string; icon: React.ReactNode }[] = [
  { field: 'title', label: 'Titre', icon: <BookOpen className="w-4 h-4" /> },
  { field: 'author', label: 'Auteur', icon: <User className="w-4 h-4" /> },
  { field: 'addedAt', label: 'Date d\'ajout', icon: <Calendar className="w-4 h-4" /> },
  { field: 'lastRead', label: 'Dernière lecture', icon: <Calendar className="w-4 h-4" /> },
  { field: 'progress', label: 'Progression', icon: <BookOpen className="w-4 h-4" /> },
  { field: 'rating', label: 'Note', icon: <Star className="w-4 h-4" /> },
];

const groupOptions: { value: BookGroupBy; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'status', label: 'Statut' },
  { value: 'genre', label: 'Genre' },
  { value: 'author', label: 'Auteur' },
  { value: 'rating', label: 'Note' },
];

export function BookSortControls({
  sortField,
  sortOrder,
  viewMode,
  groupBy,
  onSortChange,
  onViewModeChange,
  onGroupByChange,
}: BookSortControlsProps) {
  const currentSort = sortOptions.find(o => o.field === sortField);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50">
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-xs">{currentSort?.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Trier par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.field}
              onClick={() => onSortChange(option.field, sortField === option.field && sortOrder === 'asc' ? 'desc' : 'asc')}
              className="gap-2"
            >
              {option.icon}
              {option.label}
              {sortField === option.field && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group by dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="text-xs">Grouper</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Grouper par</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={groupBy} onValueChange={(v) => onGroupByChange(v as BookGroupBy)}>
            {groupOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View mode toggle */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", viewMode === 'grid' && "bg-secondary")}
          onClick={() => onViewModeChange('grid')}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", viewMode === 'list' && "bg-secondary")}
          onClick={() => onViewModeChange('list')}
        >
          <List className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
