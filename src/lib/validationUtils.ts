/**
 * Validation utilities for the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a comment/post content meets minimum requirements
 */
export const validatePostContent = (content: string): ValidationResult => {
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    return { isValid: false, error: "Content cannot be empty" };
  }
  
  if (trimmedContent.length < 10) {
    return { isValid: false, error: "Content must be at least 10 characters long" };
  }
  
  if (trimmedContent.length > 10000) {
    return { isValid: false, error: "Content cannot exceed 10,000 characters" };
  }
  
  return { isValid: true };
};

/**
 * Validates username format
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }
  
  const usernameRegex = /^[a-z0-9.-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: "Username can only contain lowercase letters, numbers, dots, and hyphens" };
  }
  
  if (username.length < 3 || username.length > 16) {
    return { isValid: false, error: "Username must be between 3 and 16 characters" };
  }
  
  return { isValid: true };
};

/**
 * Validates if a string is a valid URL
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: "URL is required" };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
};

/**
 * Sanitizes HTML content to prevent XSS
 */
export const sanitizeHtml = (html: string): string => {
  // Basic sanitization - in production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  
  return { isValid: true };
};

/**
 * Validates if a value is within a numeric range
 */
export const validateRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string = "Value"
): ValidationResult => {
  if (isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  
  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true };
};
