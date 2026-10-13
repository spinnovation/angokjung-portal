'use client';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { User } from './types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('교무기획부');
  const [regSchoolCode, setRegSchoolCode] = useState('angok2026');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          department: regDepartment,
          schoolCode: regSchoolCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      setSuccessMsg('회원가입이 완료되었습니다! 자동 로그인됩니다.');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '가입 중 오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              안곡중 교직원 인증
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 m-4 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>선생님 회원가입</span>
          </button>
        </div>

        {/* Message Banner */}
        {errorMsg && (
          <div className="mx-4 mb-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mb-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-4 pt-0 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                교직원 이메일
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="teacher@angok.es.kr"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span>교직원 로그인</span>
            </button>

            {/* Quick Test Login Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 text-center mb-1.5">
                테스트용 빠른 계정 입력
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@angok.es.kr', 'teacher1234!')}
                  className="py-1.5 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
                >
                  👑 관리교사 계정
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('teacher@angok.es.kr', 'teacher1234!')}
                  className="py-1.5 px-2 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-colors"
                >
                  🧑‍🏫 일반교사 계정
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-4 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  선생님 성함
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  소속 부서/학년
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="교무기획부">교무기획부</option>
                  <option value="교육연구부">교육연구부</option>
                  <option value="학생생활안전부">학생생활안전부</option>
                  <option value="교육과정부">교육과정부</option>
                  <option value="교육정보부">교육정보부</option>
                  <option value="1학년부">1학년부</option>
                  <option value="2학년부">2학년부</option>
                  <option value="3학년부">3학년부</option>
                  <option value="행정실">행정실</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                학교 이메일
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="teacher@angok.es.kr"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="최소 4자 이상"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                <span>학교 인증코드</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">
                  기본: angok2026
                </span>
              </label>
              <input
                type="text"
                required
                value={regSchoolCode}
                onChange={(e) => setRegSchoolCode(e.target.value)}
                placeholder="angok2026"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>선생님 회원가입 완료</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
