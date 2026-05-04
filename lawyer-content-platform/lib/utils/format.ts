/**
 * 格式化工具函数
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'yyyy-MM-dd'
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (error) {
    console.error('Date formatting error:', error);
    return String(date);
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * 格式化相对时间（例如：3 天前）
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhCN });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return String(date);
  }
}

/**
 * 格式化状态文本
 */
export function formatStatus(
  status: string,
  type: 'topic' | 'script' | 'client' = 'topic'
): string {
  const statusMap: Record<string, Record<string, string>> = {
    topic: {
      draft: '草稿',
      approved: '已通过',
      rejected: '已拒绝',
    },
    script: {
      draft: '草稿',
      reviewed: '已审核',
      approved: '已通过',
      published: '已发布',
    },
    client: {
      active: '活跃',
      inactive: '未活跃',
      trial: '试用中',
    },
  };

  return statusMap[type]?.[status] || status;
}

/**
 * 格式化状态颜色
 */
export function getStatusColor(
  status: string,
  type: 'topic' | 'script' | 'client' = 'topic'
): string {
  const colorMap: Record<string, Record<string, string>> = {
    topic: {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    },
    script: {
      draft: 'bg-gray-100 text-gray-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-purple-100 text-purple-800',
    },
    client: {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      trial: 'bg-yellow-100 text-yellow-800',
    },
  };

  return colorMap[type]?.[status] || 'bg-gray-100 text-gray-800';
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 格式化数字
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化数组为逗号分隔的字符串
 */
export function formatArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return '-';
  return arr.join('、');
}

/**
 * 格式化空值
 */
export function formatEmpty(value: string | null | undefined): string {
  return value || '-';
}

/**
 * 格式化评分
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return '-';
  return `${rating} / 5`;
}
