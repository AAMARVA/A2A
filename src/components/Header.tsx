import React from 'react';
import { Search, Moon, Sun, GitBranch, Menu, X, Terminal, BookOpen, Layers, PlayCircle } from 'lucide-react';

interface HeaderProps {
  currentDocId: string;
  onSelectDoc: (id: string) => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDocId,
  onSelectDoc,
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md md:hidden hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onSelectDoc('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-md bg-black dark:bg-white flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img
                src="/assets/a2a_logo/icon/white/SVG/a2a_icon_white.svg"
                alt="A2A Logo"
                className="w-full h-full object-contain dark:hidden"
              />
              <img
                src="/assets/a2a_logo/icon/black/SVG/a2a_icon_black.svg"
                alt="A2A Logo"
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
                  A2A Protocol
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Agent2Agent Communication Standard
              </span>
            </div>
          </button>
        </div>

        {/* Center: Quick navigation links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => onSelectDoc('what-is-a2a')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              ['what-is-a2a', 'key-concepts', 'life-of-a-task'].includes(currentDocId)
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Docs
            </span>
          </button>
          <button
            onClick={() => onSelectDoc('proto-inspector')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              ['proto-inspector', 'specification'].includes(currentDocId)
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Specification
            </span>
          </button>
          <button
            onClick={() => onSelectDoc('tutorials')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentDocId.startsWith('tut-') || currentDocId === 'tutorials'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Tutorials
            </span>
          </button>
        </nav>

        {/* Right: Search + Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-800 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search docs...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/a2aproject/A2A"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="A2A on GitHub"
          >
            <GitBranch className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
