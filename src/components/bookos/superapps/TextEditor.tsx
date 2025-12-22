import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Save,
  FolderOpen,
  FilePlus,
  Trash2,
  X,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { SuperAppProps, TextDocument } from './index';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'bookos_text_documents';

export function TextEditor({ onClose }: SuperAppProps) {
  const [documents, setDocuments] = useState<TextDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<TextDocument | null>(null);
  const [docName, setDocName] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        class: 'prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none text-foreground',
      },
    },
  });

  // Load documents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load documents:', e);
      }
    }
  }, []);

  // Save documents to localStorage
  const saveToStorage = useCallback((docs: TextDocument[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    setDocuments(docs);
  }, []);

  const createNewDocument = () => {
    const newDoc: TextDocument = {
      id: crypto.randomUUID(),
      name: 'Sans titre',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentDoc(newDoc);
    setDocName(newDoc.name);
    editor?.commands.setContent('');
  };

  const openDocument = (doc: TextDocument) => {
    setCurrentDoc(doc);
    setDocName(doc.name);
    editor?.commands.setContent(doc.content);
  };

  const saveDocument = () => {
    if (!currentDoc || !editor) return;

    const updatedDoc: TextDocument = {
      ...currentDoc,
      name: docName || 'Sans titre',
      content: editor.getHTML(),
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = documents.findIndex(d => d.id === currentDoc.id);
    let newDocs: TextDocument[];
    
    if (existingIndex >= 0) {
      newDocs = [...documents];
      newDocs[existingIndex] = updatedDoc;
    } else {
      newDocs = [...documents, updatedDoc];
    }

    saveToStorage(newDocs);
    setCurrentDoc(updatedDoc);
    toast.success('Document sauvegardé');
  };

  const deleteDocument = (docId: string) => {
    const newDocs = documents.filter(d => d.id !== docId);
    saveToStorage(newDocs);
    if (currentDoc?.id === docId) {
      setCurrentDoc(null);
      setDocName('');
      editor?.commands.setContent('');
    }
    toast.success('Document supprimé');
  };

  const sendToBackend = async () => {
    if (!currentDoc || !editor) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentDoc.id,
          name: docName,
          content: editor.getHTML(),
        }),
      });
      
      if (response.ok) {
        toast.success('Envoyé au backend');
      } else {
        toast.error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      toast.error('Backend non disponible');
    } finally {
      setIsSaving(false);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded hover:bg-muted transition-colors',
        isActive && 'bg-primary/20 text-primary'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
            <FolderOpen className="w-4 h-4" />
          </Button>
          <Input
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Nom du document"
            className="w-48 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={saveDocument} disabled={!currentDoc}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={sendToBackend} disabled={!currentDoc || isSaving}>
            <Send className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-48 border-r border-border flex flex-col">
            <div className="p-2 border-b border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={createNewDocument}
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Nouveau
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted text-sm',
                      currentDoc?.id === doc.id && 'bg-primary/20'
                    )}
                    onClick={() => openDocument(doc)}
                  >
                    <span className="truncate flex-1">{doc.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
                      className="p-1 hover:bg-destructive/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Aucun document
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          {currentDoc && (
            <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor?.isActive('underline')}
              >
                <UnderlineIcon className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor?.isActive('heading', { level: 1 })}
              >
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor?.isActive('heading', { level: 2 })}
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                isActive={editor?.isActive({ textAlign: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                isActive={editor?.isActive({ textAlign: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                isActive={editor?.isActive({ textAlign: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </ToolbarButton>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor?.isActive('orderedList')}
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
            </div>
          )}

          {/* Content */}
          <ScrollArea className="flex-1">
            {currentDoc ? (
              <EditorContent editor={editor} className="h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>Sélectionnez ou créez un document</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={createNewDocument}
                  >
                    <FilePlus className="w-4 h-4 mr-2" />
                    Nouveau document
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
