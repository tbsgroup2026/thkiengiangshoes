/**
 * TBS II — Sanitizer for Next.js / Cloudflare Workers
 * ====================================================
 * Chong XSS cho du lieu hien thi len BI dashboard.
 * Su dung: import { sanitizeDashboardData, sanitizeHtml } from '../security/sanitizer';
 */

type SanitizeMode = 'strict' | 'basic' | 'dashboard';

interface SanitizerConfig {
  mode: SanitizeMode;
  maxLength: number;
  stripNullBytes: boolean;
}

const DEFAULT_CONFIG: SanitizerConfig = {
  mode: 'strict',
  maxLength: 10000,
  stripNullBytes: true,
};

// XSS patterns
const SCRIPT_PATTERN = /<script[^>]*>[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL_PATTERN = /javascript\s*:/gi;
const OBJECT_EMBED_PATTERN = /<(?:object|embed|applet|iframe|frame|frameset)[^>]*>[\s\S]*?<\/(?:object|embed|applet|iframe|frame|frameset)>/gi;
const META_REFRESH_PATTERN = /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi;
const DATA_URI_PATTERN = /data\s*:\s*text\/html/gi;

export function sanitizeHtml(text: string, config: Partial<SanitizerConfig> = {}): string {
  if (!text) return '';

  const cfg = { ...DEFAULT_CONFIG, ...config };

  let result = text;

  if (cfg.stripNullBytes) {
    result = result.replace(/\x00/g, '');
  }

  if (cfg.mode === 'strict' || cfg.mode === 'dashboard') {
    // Remove ALL dangerous constructs
    result = result.replace(SCRIPT_PATTERN, '');
    result = result.replace(OBJECT_EMBED_PATTERN, '');
    result = result.replace(META_REFRESH_PATTERN, '');
    result = result.replace(EVENT_HANDLER_PATTERN, '');
    result = result.replace(JAVASCRIPT_URL_PATTERN, '');
    result = result.replace(DATA_URI_PATTERN, '');

    // For dashboard: strip ALL tags
    if (cfg.mode === 'dashboard') {
      result = result.replace(/<[^>]+>/g, '');
    }

    // HTML entity encode
    result = escapeHtml(result);
  }

  if (result.length > cfg.maxLength) {
    result = result.substring(0, cfg.maxLength);
  }

  return result.trim();
}

function escapeHtml(text: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (ch) => entityMap[ch] || ch);
}

/**
 * Sanitize toan bo dashboard data (string, object, array).
 */
export function sanitizeDashboardData<T>(data: T): T {
  if (typeof data === 'string') {
    return sanitizeHtml(data, { mode: 'dashboard', maxLength: 1000 }) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeDashboardData) as unknown as T;
  }
  if (data !== null && typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      sanitized[key] = sanitizeDashboardData(value);
    }
    return sanitized as unknown as T;
  }
  return data;
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^\s*javascript\s*:/i.test(trimmed)) return '';
  if (/^\s*data\s*:/i.test(trimmed)) return '';
  if (!trimmed.toLowerCase().startsWith('http://') && !trimmed.toLowerCase().startsWith('https://')) {
    return '';
  }
  if (trimmed.length > 2048) return '';
  return trimmed;
}

export function safeTextLength(text: string, maxLength: number = 5000): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  let cutPoint = maxLength;
  for (let i = maxLength - 1; i > Math.max(0, maxLength - 100); i--) {
    if ([' ', '\n', '\t', '.', ',', '。', '、'].includes(text[i])) {
      cutPoint = i + 1;
      break;
    }
  }
  return text.substring(0, cutPoint) + '…';
}
