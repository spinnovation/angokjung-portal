'use client';

import React, { useState } from 'react';
import { Eye, Plus, Trash2, Calendar, MapPin, Clock, User as UserIcon, Loader2 } from 'lucide-react';
import { GuidanceItem, User } from './types';

interface GuidanceWidgetProps {
  items: GuidanceItem[];
  user: User | null;
  onRefresh: () => void;
}

export default function GuidanceWidget({ items, user, onRefresh }: GuidanceWidgetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:20 ~ 08:50');
  const [location, setLocation] = useState('정문 및 교문');
  const [teacherName, setTeacherName] = useState(user ? user.name : '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName) return;

    setLoading(true);
    try {
      const res = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, location, teacherName, note }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNote('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 생활지도 일정을 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/guidance?id=${id}`, { method: 'DELETE' });
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
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              오늘의 생활지도
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              등하교 및 급식 안전지도 배정 현황
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>일정 등록</span>
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && user && (
        <form onSubmit={handleAdd} className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">날짜</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">시간</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="예: 08:20 ~ 08:50"
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">장소</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 급식실 2층"
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">담당교사</label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="담당 교사 성함"
                className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="지도 내용 및 비고 (예: 질서 유지 및 교문 안전 지도)"
              className="w-full px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
              className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              <span>등록</span>
            </button>
          </div>
        </form>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">날짜</th>
              <th className="py-2.5 px-3 font-semibold">시간</th>
              <th className="py-2.5 px-3 font-semibold">장소</th>
              <th className="py-2.5 px-3 font-semibold">담당교사</th>
              <th className="py-2.5 px-3 font-semibold">비고</th>
              {user && <th className="py-2.5 px-3 font-semibold w-10">관리</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location || '-'}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {item.teacherName}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                    {item.note || '-'}
                  </td>
                  {user && (
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="일정 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user ? 6 : 5} className="py-6 text-center text-slate-400">
                  등록된 생활지도 일정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
