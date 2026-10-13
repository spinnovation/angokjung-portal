'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Category } from './types';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategoryId?: string | null;
  onBlockAdded: () => void;
}

export default function AddBlockModal({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onBlockAdded,
}: AddBlockModalProps) {
  const [categoryId, setCategoryId] = useState(
    initialCategoryId || (categories[0]?.id ?? '')
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) {
      setErrorMsg('블록 제목과 카테고리를 선택해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title: title.trim(), description: description.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '블록 추가 실패');
      }

      setTitle('');
      setDescription('');
      onBlockAdded();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>새 업무 블록 추가</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              소속 카테고리
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              블록 제목
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026학년도 교원능력개발평가 운영자료"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              설명 / 비고 (선택 사항)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="블록에 대한 간략한 설명"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1 shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>블록 추가</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
