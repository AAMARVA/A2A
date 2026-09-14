import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft } from 'lucide-react';
import { DocSection } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: DocSection[];
  onSelectDoc: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  sections,
  onSelectDoc,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = query.trim()
    ? sections.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.summary && s.summary.toLowerCase().includes(q)) ||
          s.content.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : sections.slice(0, 6);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectDoc(results[selectedIndex].id);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-black rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10">
        {/* Search input header */}
        <div className="flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation, specifications, tutorials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-4 text-sm sm:text-base bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-sm font-mono">
              No documentation pages match "{query}"
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectDoc(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-3 rounded-md flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <BookOpen
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-black dark:text-white' : 'text-neutral-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
                          {item.category}
                        </span>
                      </div>
                      {item.summary && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                          {item.summary}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-4 h-4 text-black dark:text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Navigate</span>
            <kbd className="px-1 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              ↑
            </kbd>
            <kbd className="px-1 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              ↓
            </kbd>
            <span>Select</span>
            <kbd className="px-1 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              ↵
            </kbd>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              ESC
            </kbd>{' '}
            to close
          </div>
        </div>
      </div>
    </div>
  );
};
