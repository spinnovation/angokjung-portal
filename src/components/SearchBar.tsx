'use client';

import React from 'react';
import { Search, X, Layers } from 'lucide-react';
import { Category } from './types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categories: Category[];
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
}: SearchBarProps) {
  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="업무 블록명 또는 첨부파일명 검색... (예: 학사 일정, 시간표, 출결, 나이스, 태블릿, HWP)"
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
            selectedCategory === null
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>전체 카테고리 보기</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.blocks.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
