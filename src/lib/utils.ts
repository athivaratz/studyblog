// =====================
// Shared Utility Functions
// =====================

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

/**
 * Format due date for display with urgency info (todo/homework style)
 */
export function formatDueDate(date?: Date): { text: string; urgent: boolean } | null {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: "เลยกำหนด", urgent: true };
  if (days === 0) return { text: "วันนี้", urgent: true };
  if (days === 1) return { text: "พรุ่งนี้", urgent: false };

  const d = date.getDate();
  const m = date.getMonth();
  return { text: `${d} ${THAI_MONTHS[m]}`, urgent: false };
}

/**
 * Format due date as simple countdown text (homework list style)
 */
export function formatDueDateShort(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "เลยกำหนด";
  if (days === 0) return "วันนี้";
  if (days === 1) return "พรุ่งนี้";
  return `${days} วัน`;
}

/**
 * Format a date in Thai short format: "25 ม.ค."
 */
export function formatThaiDate(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]}`;
}

/**
 * Get a date threshold for "urgent" items (2 days from now)
 */
export function getUrgentThreshold(): Date {
  return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
}

/**
 * Detect if the current browser is an in-app WebView (LINE, Facebook, Instagram, etc.)
 * Google blocks OAuth sign-in from these embedded browsers (403: disallowed_useragent)
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  // Common in-app browser signatures
  const inAppPatterns = [
    /\bFBAN\b/i,           // Facebook App
    /\bFBAV\b/i,           // Facebook App
    /\bFB_IAB\b/i,         // Facebook In-App Browser
    /\bInstagram/i,        // Instagram
    /\bLine\//i,           // LINE
    /\bTwitter/i,          // Twitter / X
    /\bSnapchat/i,         // Snapchat
    /\bWeChat/i,           // WeChat
    /\bMicroMessenger/i,   // WeChat
    /\bTikTok/i,           // TikTok
    /\bBytedanceWebview/i, // TikTok/ByteDance WebView
    /\bPinterest/i,        // Pinterest
    /\bLinkedIn/i,         // LinkedIn
    /\bGSA\//i,            // Google Search App (iOS)
    /\bDaumApps/i,         // Daum (Korean app)
    /\bKakaotalk/i,        // KakaoTalk
    /\bNAVER/i,            // Naver
    /\bZalo/i,             // Zalo (Vietnamese app)
  ];

  // Check for WebView indicators
  const isWebView =
    inAppPatterns.some((pattern) => pattern.test(ua)) ||
    // Android WebView detection
    (ua.includes("wv") && ua.includes("Android")) ||
    // iOS WebView detection (no Safari in UA but has AppleWebKit)
    (/iPhone|iPad|iPod/.test(ua) && !ua.includes("Safari") && ua.includes("AppleWebKit"));

  return isWebView;
}

/**
 * Check if the current device is mobile (phone or tablet)
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  // Check for mobile device indicators
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

/**
 * Check if the current browser is Chrome on mobile
 */
export function isMobileChrome(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  // Chrome on Android
  return isMobileDevice() && /Chrome/i.test(ua) && /Android/i.test(ua) && !/Edg/i.test(ua);
}

/**
 * Check if the current browser is Safari on iOS
 */
export function isMobileSafari(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || navigator.vendor || "";

  // Safari on iOS (must have Safari in UA and not be in-app browser)
  return /iPhone|iPad|iPod/.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
}

/**
 * Check if the current browser is a supported mobile browser (Chrome or Safari)
 */
export function isSupportedMobileBrowser(): boolean {
  return isMobileChrome() || isMobileSafari();
}
