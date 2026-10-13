'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Lock, FileUp, Download } from 'lucide-react';

export default function NoticeBanner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl p-4 sm:p-5 text-amber-900 dark:text-amber-200 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100">
                안곡중학교 교원 업무 아카이브 이용 안내
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300 font-medium">
                2026학년도 최신판
              </span>
            </div>

            {!collapsed && (
              <div className="mt-2.5 space-y-1.5 text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span>
                    <strong>교원 전용 공간:</strong> 안곡중학교 선생님들을 위한 교무·학사·기자재 업무 지원 문서함입니다.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <Download className="w-3.5 h-3.5 inline text-blue-600 dark:text-blue-400" />
                    <strong>파일 열람/다운로드:</strong> 로그인 없이도 각 블록을 클릭하여 등록된 파일을 바로 내려받을 수 있습니다.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <FileUp className="w-3.5 h-3.5 inline text-emerald-600 dark:text-emerald-400" />
                    <strong>파일 업로드 권한:</strong> 교직원 회원가입 후 로그인하시면 모든 업무 블록에 문서를 업로드하고 관리할 수 있습니다.
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-1 text-xs text-amber-700 dark:text-amber-400">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                  <span>
                    가입 시 학교 인증코드: <code className="bg-amber-100 dark:bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200 font-mono font-semibold">angok2026</code> (또는 &apos;안곡중&apos;)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-amber-700 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-200 p-1 rounded-md hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors"
          title={collapsed ? '상세 안내 펼치기' : '접기'}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
