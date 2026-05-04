/**
 * useToast Hook
 * Toast 通知封装（基于 sonner）
 */

'use client';

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  return {
    toast: (options: ToastOptions & { variant?: 'default' | 'destructive' }) => {
      const { title, description, duration = 3000, variant = 'default' } = options;

      const message = title || description || '';
      const descriptionText = title && description ? description : undefined;

      if (variant === 'destructive') {
        sonnerToast.error(message, {
          description: descriptionText,
          duration,
        });
      } else {
        sonnerToast(message, {
          description: descriptionText,
          duration,
        });
      }
    },
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
        duration: 3000,
      });
    },
    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
        duration: 4000,
      });
    },
    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
        duration: 3000,
      });
    },
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
        duration: 3000,
      });
    },
  };
}
