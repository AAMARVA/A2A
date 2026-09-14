import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DocViewer } from './components/DocViewer';
import { ProtoViewer } from './components/ProtoViewer';
import { SearchModal } from './components/SearchModal';
import { DOC_SECTIONS } from './data/docsRegistry';

export const App: React.FC = () => {
  // Hash-based routing
  const getInitialDocId = () => {
    try {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
      if (hash && DOC_SECTIONS.some(s => s.id === hash)) {
        return hash;
      }
    } catch {
      // In restricted iframes, window.location.hash may be restricted
    }
    return 'home';
  };

  const [currentDocId, setCurrentDocId] = useState<string>(getInitialDocId);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      // In restricted iframe environments, matchMedia may throw
    }
    return false;
  });

  // Sync hash
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace(/^#/, '');
        if (hash && DOC_SECTIONS.some(s => s.id === hash)) {
          setCurrentDocId(hash);
        }
      } catch {
        // ignore
      }
    };
    try {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    } catch {
      // ignore
    }
  }, []);

  const handleSelectDoc = (id: string) => {
    setCurrentDocId(id);
    try {
      window.location.hash = id;
    } catch {
      // ignore
    }
    try {
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // ignore
    }
  };

  // Sync Dark mode to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentSection = DOC_SECTIONS.find(s => s.id === currentDocId) || DOC_SECTIONS[0];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      <Header
        currentDocId={currentDocId}
        onSelectDoc={handleSelectDoc}
        onOpenSearch={() => setSearchOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar
          currentDocId={currentDocId}
          onSelectDoc={handleSelectDoc}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 pb-16">
          {currentDocId === 'proto-inspector' ? (
            <ProtoViewer onSelectDoc={handleSelectDoc} />
          ) : (
            <DocViewer
              section={currentSection}
              allSections={DOC_SECTIONS}
              onSelectDoc={handleSelectDoc}
            />
          )}
        </main>
      </div>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        sections={DOC_SECTIONS}
        onSelectDoc={handleSelectDoc}
      />
    </div>
  );
};
