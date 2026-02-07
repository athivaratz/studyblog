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
