'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '@/components/Header';
import NoticeBanner from '@/components/NoticeBanner';
import SearchBar from '@/components/SearchBar';
import BlockGrid from '@/components/BlockGrid';
import FileModal from '@/components/FileModal';
import AuthModal from '@/components/AuthModal';
import GuidanceWidget from '@/components/GuidanceWidget';
import TodoWidget from '@/components/TodoWidget';
import AddBlockModal from '@/components/AddBlockModal';
import { Category, Block, User, GuidanceItem, TodoItem } from '@/components/types';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guidanceItems, setGuidanceItems] = useState<GuidanceItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [addBlockInitialCatId, setAddBlockInitialCatId] = useState<string | null>(null);

  // Check dark mode
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [userRes, catRes, guideRes, todoRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/categories'),
        fetch('/api/guidance'),
        fetch('/api/todos'),
      ]);

      const userData = await userRes.json();
      setUser(userData.user);

      const catData = await catRes.json();
      setCategories(catData.categories || []);

      const guideData = await guideRes.json();
      setGuidanceItems(guideData.guidance || []);

      const todoData = await todoRes.json();
      setTodos(todoData.todos || []);
    } catch (err) {
      console.error('Failed to fetch initial portal data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh single block if open in modal
  const handleRefreshCurrentBlock = useCallback(async () => {
    if (!selectedBlock) return;
    try {
      const res = await fetch(`/api/blocks/${selectedBlock.id}`);
      const data = await res.json();
      if (data.block) {
        setSelectedBlock(data.block);
      }
      // Also refresh full categories for file badges
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, [selectedBlock]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered categories based on search and category tab
  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return categories
      .filter((cat) => {
        if (selectedCategory && cat.id !== selectedCategory) return false;
        return true;
      })
      .map((cat) => {
        if (!query) return cat;

        const matchingBlocks = cat.blocks.filter((b) => {
          const matchTitle = b.title.toLowerCase().includes(query);
          const matchDesc = b.description?.toLowerCase().includes(query);
          const matchFile = b.files?.some((f) =>
            f.originalName.toLowerCase().includes(query)
          );
          return matchTitle || matchDesc || matchFile;
        });

        return {
          ...cat,
          blocks: matchingBlocks,
        };
      })
      .filter((cat) => !query || cat.blocks.length > 0);
  }, [categories, selectedCategory, searchTerm]);

  // Stats calculation
  const totalBlocks = useMemo(() => {
    return categories.reduce((sum, c) => sum + c.blocks.length, 0);
  }, [categories]);

  const totalFiles = useMemo(() => {
    return categories.reduce(
      (sum, c) =>
        sum +
        c.blocks.reduce((bSum, b) => bSum + (b.files?.length || 0), 0),
      0
    );
  }, [categories]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddBlock={() => {
          setAddBlockInitialCatId(categories[0]?.id || null);
          setIsAddBlockModalOpen(true);
        }}
        totalBlocks={totalBlocks}
        totalFiles={totalFiles}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Notice Callout */}
        <NoticeBanner />

        {/* Search & Category Filter */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">안곡중 교원 포털 로딩 중...</p>
          </div>
        ) : (
          <>
            {/* 5-Column Dashboard */}
            {filteredCategories.length > 0 ? (
              <BlockGrid
                categories={filteredCategories}
                onSelectBlock={(b) => setSelectedBlock(b)}
                onOpenAddBlockForCategory={(catId) => {
                  setAddBlockInitialCatId(catId);
                  setIsAddBlockModalOpen(true);
                }}
                isLoggedIn={!!user}
              />
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  &apos;{searchTerm}&apos;에 해당하는 업무 블록 또는 파일이 없습니다.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  검색어 초기화
                </button>
              </div>
            )}

            {/* Bottom Widgets: 생활지도 & To-Do List */}
            <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GuidanceWidget
                items={guidanceItems}
                user={user}
                onRefresh={fetchData}
              />
              <TodoWidget
                todos={todos}
                user={user}
                onRefresh={fetchData}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            안곡중학교 교원 업무 통합 아카이브 · 공감 (共感)
          </p>
          <p className="text-[11px] text-slate-400">
            교무기획부 · 교육연구부 · 학생생활안전부 · 교육과정부 · 교육정보부 · 학년부
          </p>
          <p className="text-[10px] text-slate-400 pt-1">
            © 2026 Angok Middle School. All files and documents are for teacher use only.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {selectedBlock && (
        <FileModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          user={user}
          onOpenAuth={() => {
            setSelectedBlock(null);
            setIsAuthModalOpen(true);
          }}
          onFileUploaded={handleRefreshCurrentBlock}
          onFileDeleted={handleRefreshCurrentBlock}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(u) => {
            setUser(u);
            fetchData();
          }}
        />
      )}

      {isAddBlockModalOpen && (
        <AddBlockModal
          isOpen={isAddBlockModalOpen}
          onClose={() => setIsAddBlockModalOpen(false)}
          categories={categories}
          initialCategoryId={addBlockInitialCatId}
          onBlockAdded={fetchData}
        />
      )}
    </div>
  );
}
