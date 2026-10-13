'use client';

import React from 'react';
import {
  FileText,
  Paperclip,
  Plus,
  BookOpen,
  Briefcase,
  GraduationCap,
  Monitor,
  Folder,
} from 'lucide-react';
import { Category, Block } from './types';

interface BlockGridProps {
  categories: Category[];
  onSelectBlock: (block: Block) => void;
  onOpenAddBlockForCategory?: (categoryId: string) => void;
  isLoggedIn: boolean;
}

// Icon mapper for category
const getCategoryIcon = (iconName?: string | null) => {
  switch (iconName) {
    case 'Info':
      return <BookOpen className="w-4 h-4" />;
    case 'Briefcase':
      return <Briefcase className="w-4 h-4" />;
    case 'FileText':
      return <FileText className="w-4 h-4" />;
    case 'GraduationCap':
      return <GraduationCap className="w-4 h-4" />;
    case 'Monitor':
      return <Monitor className="w-4 h-4" />;
    default:
      return <Folder className="w-4 h-4" />;
  }
};

// Color theme helper for Category Header
const getCategoryStyles = (color?: string | null) => {
  switch (color) {
    case 'blue':
      return {
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        bar: 'bg-blue-500',
      };
    case 'purple':
      return {
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        bar: 'bg-purple-500',
      };
    case 'emerald':
      return {
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        bar: 'bg-emerald-500',
      };
    case 'amber':
      return {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        bar: 'bg-amber-500',
      };
    case 'rose':
      return {
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        bar: 'bg-rose-500',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        bar: 'bg-slate-500',
      };
  }
};

export default function BlockGrid({
  categories,
  onSelectBlock,
  onOpenAddBlockForCategory,
  isLoggedIn,
}: BlockGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {categories.map((category) => {
        const styles = getCategoryStyles(category.badgeColor);
        const totalFilesInCat = category.blocks.reduce(
          (sum, b) => sum + (b.files?.length || 0),
          0
        );

        return (
          <div
            key={category.id}
            className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
          >
            {/* Category Header */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 relative">
              <div
                className={`absolute top-0 left-0 right-0 h-0.75 ${styles.bar}`}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg border text-xs shrink-0 ${styles.badge}`}
                  >
                    {getCategoryIcon(category.icon)}
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {category.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {category.blocks.length}개
                  </span>
                  {totalFilesInCat > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      📎 {totalFilesInCat}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Block List */}
            <div className="p-2 space-y-1.5 flex-1 overflow-y-auto max-h-[580px]">
              {category.blocks.map((block) => {
                const fileCount = block.files?.length || 0;
                return (
                  <button
                    key={block.id}
                    onClick={() => onSelectBlock(block)}
                    className="w-full text-left p-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug break-words">
                        {block.title}
                      </span>
                    </div>

                    {/* File Count Badge */}
                    <div className="shrink-0 flex items-center">
                      {fileCount > 0 ? (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          {fileCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 group-hover:text-slate-400">
                          -
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Add Block in Column (if logged in) */}
              {isLoggedIn && onOpenAddBlockForCategory && (
                <button
                  onClick={() => onOpenAddBlockForCategory(category.id)}
                  className="w-full py-2 px-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs flex items-center justify-center gap-1 transition-colors mt-2"
                >
                  <Plus className="w-3 h-3" />
                  <span>새 블록 추가</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
