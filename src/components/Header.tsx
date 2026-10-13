'use client';

import React from 'react';
import { School, Moon, Sun, LogIn, LogOut, Plus, User as UserIcon, Shield } from 'lucide-react';
import { User } from './types';

interface HeaderProps {
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAddBlock: () => void;
  totalBlocks: number;
  totalFiles: number;
}

export default function Header({
  user,
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
  onLogout,
  onOpenAddBlock,
  totalBlocks,
  totalFiles,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & School Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <School className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                안곡중학교 <span className="text-blue-600 dark:text-blue-400">공감 (共感)</span>
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                교원 업무 아카이브
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5개 부서 · {totalBlocks}개 업무 블록 · 등록 파일 {totalFiles}건
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Add Block button (if logged in) */}
          {user && (
            <button
              onClick={onOpenAddBlock}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>블록 추가</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-xs">
                {user.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  ({user.department || '교사'})
                </span>
              </div>
              <button
                onClick={onLogout}
                title="로그아웃"
                className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>교직원 로그인 / 가입</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
