// Shared utilities for Kanvaro

export function generateLexoRank(before?: string, after?: string): string {
  // Simple implementation - in production, use a proper LexoRank library
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const length = 6;
  
  if (!before && !after) {
    return '0|' + '0'.repeat(length);
  }
  
  if (!before) {
    return '0|' + '0'.repeat(length - 1) + '1';
  }
  
  if (!after) {
    return '0|' + '9'.repeat(length);
  }
  
  // Simple midpoint calculation
  const beforeNum = parseInt(before.split('|')[1], 36);
  const afterNum = parseInt(after.split('|')[1], 36);
  const midNum = Math.floor((beforeNum + afterNum) / 2);
  
  return '0|' + midNum.toString(36).padStart(length, '0');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function calculateVelocity(completedPoints: number[], sprints: number): number {
  if (completedPoints.length === 0) return 0;
  
  const recentSprints = completedPoints.slice(-sprints);
  return recentSprints.reduce((sum, points) => sum + points, 0) / recentSprints.length;
}
