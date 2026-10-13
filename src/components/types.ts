export interface User {
  id: string;
  email: string;
  name: string;
  department?: string | null;
  role: string;
}

export interface FileRecord {
  id: string;
  blockId: string;
  userId?: string | null;
  uploaderName: string;
  originalName: string;
  savedName: string;
  fileType: string;
  fileSize: number;
  memo?: string | null;
  createdAt: string;
}

export interface Block {
  id: string;
  categoryId: string;
  title: string;
  icon?: string | null;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  files: FileRecord[];
}

export interface Category {
  id: string;
  title: string;
  icon?: string | null;
  badgeColor?: string | null;
  sortOrder: number;
  blocks: Block[];
}

export interface GuidanceItem {
  id: string;
  date: string;
  time?: string | null;
  location?: string | null;
  teacherName: string;
  note?: string | null;
}

export interface TodoItem {
  id: string;
  title: string;
  department?: string | null;
  targetDate?: string | null;
  completed: boolean;
  memo?: string | null;
}
