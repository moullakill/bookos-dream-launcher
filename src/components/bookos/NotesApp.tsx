import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Note } from '@/types/bookos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8080/api';

interface NotesAppProps {
  onClose: () => void;
}

export function NotesApp({ onClose }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showList, setShowList] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-foreground',
      },
    },
  });

  // Load notes from localStorage and backend
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Try localStorage first
        const stored = localStorage.getItem('bookos-notes');
        if (stored) {
          setNotes(JSON.parse(stored));
        }

        // Try backend
        const response = await fetch(`${API_BASE}/notes`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setNotes(data.data);
            localStorage.setItem('bookos-notes', JSON.stringify(data.data));
          }
        }
      } catch (error) {
        console.log('Using local notes storage');
      }
    };

    loadNotes();
  }, []);

  // Save notes
  const saveNotes = useCallback(async (updatedNotes: Note[]) => {
    localStorage.setItem('bookos-notes', JSON.stringify(updatedNotes));
    
    try {
      await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNotes),
      });
    } catch (error) {
      console.log('Backend sync failed, saved locally');
    }
  }, []);

  // Create new note
  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nouvelle note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    selectNote(newNote);
  };

  // Select note
  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    editor?.commands.setContent(note.content);
    setShowList(false);
  };

  // Save current note
  const saveCurrentNote = async () => {
    if (!selectedNote || !editor) return;

    setIsSaving(true);
    
    const updatedNote: Note = {
      ...selectedNote,
      title: noteTitle || 'Sans titre',
      content: editor.getHTML(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setNotes(updatedNotes);
    setSelectedNote(updatedNote);
    
    await saveNotes(updatedNotes);
    
    // Try to sync with backend
    try {
      await fetch(`${API_BASE}/notes/${updatedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });
      toast.success('Note sauvegardée');
    } catch (error) {
      toast.success('Note sauvegardée localement');
    }
    
    setIsSaving(false);
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);

    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setNoteTitle('');
      editor?.commands.clearContent();
      setShowList(true);
    }

    try {
      await fetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' });
    } catch (error) {
      console.log('Backend delete failed');
    }

    toast.success('Note supprimée');
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        {!showList && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowList(true)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <h2 className="font-display font-medium flex-1">
          {showList ? 'Notes' : 'Éditer'}
        </h2>

        {showList ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={createNote}
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={saveCurrentNote}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Fermer
        </Button>
      </div>

      {showList ? (
        /* Notes List */
        <ScrollArea className="flex-1">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-3">
              <FileText className="w-12 h-12 opacity-50" />
              <p className="text-center">Aucune note</p>
              <Button variant="outline" size="sm" onClick={createNote}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une note
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => selectNote(note)}
                >
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      ) : (
        /* Editor */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title input */}
          <Input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Titre de la note"
            className="border-0 border-b rounded-none text-lg font-medium focus-visible:ring-0"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-border overflow-x-auto">
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('bold') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('italic') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('underline') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('strike') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('bulletList') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive('orderedList') && 'bg-accent')}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive({ textAlign: 'left' }) && 'bg-accent')}
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive({ textAlign: 'center' }) && 'bg-accent')}
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor?.isActive({ textAlign: 'right' }) && 'bg-accent')}
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor content */}
          <ScrollArea className="flex-1">
            <EditorContent editor={editor} className="min-h-full" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
