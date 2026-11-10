export function generateId(prefix: string = 'biz'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export function formatDocNumber(prefix: string, number: number, digits: number = 4): string {
  return `${prefix}${String(number).padStart(digits, '0')}`;
}
