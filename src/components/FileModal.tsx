'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  File as FileGeneric,
  Calendar,
  User as UserIcon,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
  LogIn,
} from 'lucide-react';
import { Block, FileRecord, User } from './types';

interface FileModalProps {
  block: Block | null;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onFileUploaded: () => void;
  onFileDeleted: () => void;
}

// Format file size
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes()
  ).padStart(2, '0')}`;
}

// Get file icon & color badge
function getFileInfo(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['hwp', 'hwpx'].includes(ext)) {
    return {
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: 'HWP 한글',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    };
  }
  if (['pdf'].includes(ext)) {
    return {
      icon: <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      badge: 'PDF',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return {
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      badge: '엑셀',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return {
      icon: <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      badge: 'PPT',
      badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    };
  }
  if (['zip', 'rar', '7z', 'tar'].includes(ext)) {
    return {
      icon: <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      badge: '압축파일',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    };
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return {
      icon: <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      badge: '이미지',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    };
  }
  return {
    icon: <FileGeneric className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
    badge: ext.toUpperCase() || '문서',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  };
}

export default function FileModal({
  block,
  onClose,
  user,
  onOpenAuth,
  onFileUploaded,
  onFileDeleted,
}: FileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [memo, setMemo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!block) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!user) {
      setErrorMsg('파일 업로드는 로그인한 교직원만 가능합니다.');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('업로드할 파일을 먼저 선택해주세요.');
      return;
    }
    if (!user) {
      setErrorMsg('로그인이 필요합니다.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('blockId', block.id);
      if (memo.trim()) {
        formData.append('memo', memo.trim());
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '파일 업로드 실패');
      }

      setSuccessMsg('파일이 성공적으로 업로드되었습니다.');
      setSelectedFile(null);
      setMemo('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onFileUploaded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('정말 이 파일을 삭제하시겠습니까?')) return;

    setDeletingId(fileId);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '파일 삭제 실패');
      }
      onFileDeleted();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                업무 블록
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                첨부 파일 {block.files?.length || 0}건
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              {block.title}
            </h2>
            {block.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {block.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2.5">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>문서 / 파일 업로드</span>
            </h3>

            {user ? (
              <form onSubmit={handleUpload} className="space-y-3">
                {/* Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        선택된 파일: {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(selectedFile.size)} · 클릭하여 다른 파일로 변경
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-slate-400" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        파일을 드래그하여 놓거나{' '}
                        <span className="text-blue-600 dark:text-blue-400 underline">
                          클릭하여 선택
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        HWP, PDF, XLSX, PPTX, DOCX, ZIP 등 모든 포맷 지원 (최대 100MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Memo input */}
                <div>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="파일 설명 또는 비고 입력 (선택 사항, 예: 2026학년도 1학기 최종본)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>업로드 중...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>파일 업로드</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 px-2 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  🔒 파일 업로드는 <strong>로그인한 교직원</strong>만 가능합니다.
                </p>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>교직원 로그인하기</span>
                </button>
              </div>
            )}
          </div>

          {/* Attached Files List */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-3">
              <FileGeneric className="w-4 h-4 text-slate-500" />
              <span>등록된 파일 목록 ({block.files?.length || 0}건)</span>
            </h3>

            {block.files && block.files.length > 0 ? (
              <div className="space-y-2.5">
                {block.files.map((file) => {
                  const info = getFileInfo(file.originalName);
                  const isAuthor = user && (user.role === 'admin' || file.userId === user.id);

                  return (
                    <div
                      key={file.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                          {info.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {file.originalName}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${info.badgeClass}`}
                            >
                              {info.badge}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatBytes(file.fileSize)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(file.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3 text-slate-400" />
                              {file.uploaderName}
                            </span>
                          </div>

                          {file.memo && (
                            <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-md flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{file.memo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <a
                          href={`/api/files/${file.id}`}
                          download={file.originalName}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/60 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>다운로드</span>
                        </a>

                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deletingId === file.id}
                            title="파일 삭제"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            {deletingId === file.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <FileGeneric className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  아직 첨부된 문서가 없습니다.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  상단의 파일 업로드 영역에서 문서를 등록할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
