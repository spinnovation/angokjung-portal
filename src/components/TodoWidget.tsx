'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { TodoItem, User } from './types';

interface TodoWidgetProps {
  todos: TodoItem[];
  user: User | null;
  onRefresh: () => void;
}

export default function TodoWidget({ todos, user, onRefresh }: TodoWidgetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('교무기획부');
  const [targetDate, setTargetDate] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = async (todo: TodoItem) => {
    if (!user) return;
    try {
      await fetch('/api/todos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todo.id, completed: !todo.completed }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, department, targetDate, memo }),
      });
      if (res.ok) {
        setTitle('');
        setMemo('');
        setShowAddForm(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 과업을 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              To-Do List
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              교무 부서별 주요 업무 체크리스트
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 과업 추가</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && user && (
        <form onSubmit={handleAdd} className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">과업명</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="과업 내용을 입력하세요"
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">담당 부서</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="교무기획부">교무기획부</option>
                <option value="교육연구부">교육연구부</option>
                <option value="학생생활안전부">학생생활안전부</option>
                <option value="교육과정부">교육과정부</option>
                <option value="교육정보부">교육정보부</option>
                <option value="1학년부">1학년부</option>
                <option value="2학년부">2학년부</option>
                <option value="3학년부">3학년부</option>
                <option value="학교전체">학교전체</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">마감 기한</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">메모 / 비고</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="비고 입력 (선택)"
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              <span>추가</span>
            </button>
          </div>
        </form>
      )}

      {/* Todo Items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                todo.completed ? 'bg-slate-50/50 dark:bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => handleToggle(todo)}
                  disabled={!user}
                  title={user ? '완료 여부 토글' : '로그인 후 체크 가능'}
                  className="shrink-0 mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:cursor-not-allowed"
                >
                  {todo.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium ${
                        todo.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.department && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {todo.department}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                    {todo.targetDate && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        기한: {todo.targetDate}
                      </span>
                    )}
                    {todo.memo && <span>{todo.memo}</span>}
                  </div>
                </div>
              </div>

              {user && (
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 shrink-0"
                  title="과업 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            등록된 과업이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
