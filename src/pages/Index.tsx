import { useState, useCallback } from 'react';
import { useBookOS } from '@/hooks/useBookOS';
import { getThemeClass } from '@/components/bookos/ThemeSelector';
import { LockScreen } from '@/components/bookos/LockScreen';
import { StatusBar } from '@/components/bookos/StatusBar';
import { Dock } from '@/components/bookos/Dock';
import { HomeView } from '@/components/bookos/HomeView';
import { LibraryView } from '@/components/bookos/LibraryView';
import { SettingsPanel } from '@/components/bookos/SettingsPanel';
import { DeveloperSettings } from '@/components/bookos/DeveloperSettings';
import { SecretVault } from '@/components/bookos/SecretVault';
import { Modal } from '@/components/bookos/Modal';
import { AppForm } from '@/components/bookos/AppForm';
import { BookForm } from '@/components/bookos/BookForm';
import { App, Book } from '@/types/bookos';
import { cn } from '@/lib/utils';

type ViewType = 'home' | 'library' | 'settings' | 'developer';
type ModalType = 'addApp' | 'editApp' | 'addBook' | 'editBook' | null;

const Index = () => {
  const {
    apps,
    books,
    settings,
    secrets,
    isLoading,
    isUnlocked,
    isOnline,
    addApp,
    updateApp,
    deleteApp,
    openApp,
    addBook,
    updateBook,
    deleteBook,
    openBook,
    updateSettings,
    setLockCode,
    unlock,
    lock,
    addSecret,
    updateSecret,
    deleteSecret,
    openSecretItem,
  } = useBookOS();

  const [activeView, setActiveView] = useState<ViewType>('home');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [showSecretVault, setShowSecretVault] = useState(false);

  const themeClass = getThemeClass(settings.theme);

  const handleTitleClick = useCallback(() => {
    setTitleClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setActiveView('developer');
        return 0;
      }
      // Reset after 2 seconds of inactivity
      setTimeout(() => setTitleClickCount(0), 2000);
      return newCount;
    });
  }, []);

  const handleOpenApp = (app: App) => {
    openApp(app);
  };

  const handleOpenBook = (book: Book) => {
    openBook(book);
  };

  const handleEditApp = (app: App) => {
    setSelectedApp(app);
    setModalType('editApp');
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setModalType('editBook');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedApp(null);
    setSelectedBook(null);
  };

  if (isLoading) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center bg-background', themeClass)}>
        <div className="animate-pulse-soft text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', themeClass)}>
      {/* Background image */}
      {settings.backgroundImage && (
        <>
          <div 
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${settings.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `blur(${settings.backgroundBlur}px)`,
            }}
          />
          <div className="fixed inset-0 bg-background/60 z-0" />
        </>
      )}

      {/* Connection status indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 text-destructive-foreground text-xs text-center py-1">
          Mode hors-ligne - Les données sont sauvegardées localement
        </div>
      )}

      {/* Lock screen */}
      {!isUnlocked && settings.lockCode && (
        <LockScreen onUnlock={unlock} />
      )}

      {/* Main content */}
      <div className="relative flex flex-col h-screen z-10">
        <StatusBar 
          onTitleClick={handleTitleClick}
          titleClickCount={titleClickCount}
        />

        {activeView === 'home' && (
          <HomeView
            apps={apps}
            onOpenApp={handleOpenApp}
            onEditApp={handleEditApp}
            iconSize={settings.appIconSize}
          />
        )}

        {activeView === 'library' && (
          <LibraryView
            books={books}
            apps={apps}
            onOpenBook={handleOpenBook}
            onEditBook={handleEditBook}
            cardSize={settings.bookCardSize}
          />
        )}

        {activeView === 'settings' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h1 className="font-display text-xl font-medium mb-6">Réglages</h1>
            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onSetLockCode={setLockCode}
              onLock={lock}
            />
          </div>
        )}

        {activeView === 'developer' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h1 className="font-display text-xl font-medium mb-6">Mode Développeur</h1>
            <DeveloperSettings onClose={() => setActiveView('settings')} />
          </div>
        )}

        <Dock
          activeView={activeView === 'developer' ? 'settings' : activeView}
          onViewChange={setActiveView}
          onAddApp={() => setModalType('addApp')}
          onAddBook={() => setModalType('addBook')}
          onOpenSecretVault={() => setShowSecretVault(true)}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'addApp'}
        onClose={closeModal}
        title="Ajouter une application"
      >
        <AppForm
          onSave={(app) => {
            addApp(app);
            closeModal();
          }}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'editApp'}
        onClose={closeModal}
        title="Modifier l'application"
      >
        {selectedApp && (
          <AppForm
            app={selectedApp}
            onSave={(app) => {
              updateApp(selectedApp.id, app);
              closeModal();
            }}
            onDelete={() => {
              deleteApp(selectedApp.id);
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalType === 'addBook'}
        onClose={closeModal}
        title="Ajouter un livre"
      >
        <BookForm
          apps={apps}
          onSave={(book) => {
            addBook(book);
            closeModal();
          }}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalType === 'editBook'}
        onClose={closeModal}
        title="Modifier le livre"
      >
        {selectedBook && (
          <BookForm
            book={selectedBook}
            apps={apps}
            onSave={(book) => {
              updateBook(selectedBook.id, book);
              closeModal();
            }}
            onDelete={() => {
              deleteBook(selectedBook.id);
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Secret Vault */}
      {showSecretVault && (
        <SecretVault
          secrets={secrets}
          onAddSecret={addSecret}
          onUpdateSecret={updateSecret}
          onDeleteSecret={deleteSecret}
          onOpenSecret={openSecretItem}
          onClose={() => setShowSecretVault(false)}
        />
      )}
    </div>
  );
};

export default Index;
