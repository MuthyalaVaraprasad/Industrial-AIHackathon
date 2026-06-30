import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function getDocumentType(filename: string): 'pdf' | 'docx' | 'xlsx' | 'image' | 'other' {
  const ext = getFileExtension(filename);
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'docx';
  if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'tiff'].includes(ext)) return 'image';
  return 'other';
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
