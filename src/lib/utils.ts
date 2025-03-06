import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random ID string
 */
export function getRandomId(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Checks if a file is a valid resume file type
 */
export function isResumeFile(file: File): boolean {
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension) return false;
  
  const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'rtf'];
  
  return validExtensions.includes(extension);
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Attempts to extract a name from resume text
 */
export function extractNameFromResume(text: string): string {
  // Very basic name extraction - look for patterns that might indicate a name
  // This is a simplified approach; in a production app, use NLP or more sophisticated techniques
  
  // Look for common resume name patterns (usually at the beginning)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Often the first non-empty line is the name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    
    // If the first line is short (likely just a name)
    if (firstLine.length < 40) {
      return firstLine;
    }
  }
  
  // Fallback to generic name
  return "Resume Expert";
}

/**
 * Gets an environment variable, throws an error if not found
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}