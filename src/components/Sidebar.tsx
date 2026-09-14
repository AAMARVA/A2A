import React, { useState } from 'react';
import {
  Compass,
  Layers,
  FileCode2,
  PlayCircle,
  GraduationCap,
  Puzzle,
  Users,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { NAV_CATEGORIES } from '../data/docsRegistry';

interface SidebarProps {
  currentDocId: string;
  onSelectDoc: (id: string) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-3.5 h-3.5" />,
  Layers: <Layers className="w-3.5 h-3.5" />,
  FileCode2: <FileCode2 className="w-3.5 h-3.5" />,
  PlayCircle: <PlayCircle className="w-3.5 h-3.5" />,
  GraduationCap: <GraduationCap className="w-3.5 h-3.5" />,
  Puzzle: <Puzzle className="w-3.5 h-3.5" />,
  Users: <Users className="w-3.5 h-3.5" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentDocId,
  onSelectDoc,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  // Start with categories open by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'get-started': true,
    'core-docs': true,
    'specification-cat': true,
    'tutorials-cat': true,
    'extensions-cat': false,
    'community-cat': false,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleItemClick = (id: string) => {
    onSelectDoc(id);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobileMenu}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Navigation categories */}
          <nav className="space-y-4">
            {NAV_CATEGORIES.map((cat) => {
              const isOpen = openCategories[cat.id] ?? true;
              return (
                <div key={cat.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 dark:text-neutral-500">
                        {ICON_MAP[cat.icon] || <Layers className="w-3.5 h-3.5" />}
                      </span>
                      <span>{cat.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3 h-3 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-5 pr-1 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3.5">
                      {cat.items.map((item) => {
                        const isActive = currentDocId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemClick(item.id)}
                            className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                              isActive
                                ? 'font-semibold text-black dark:text-white bg-neutral-100 dark:bg-neutral-900'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-mono border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-600 dark:text-neutral-400"
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* External links */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-xs">
            <div className="px-2 py-1 font-semibold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider text-[10px]">
              External References
            </div>
            <a
              href="https://goo.gle/dlai-a2a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>DeepLearning.AI Course</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>Model Context Protocol</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://google.github.io/adk-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>Agent Development Kit</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
