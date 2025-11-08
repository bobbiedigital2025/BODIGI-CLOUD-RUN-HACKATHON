/**
 * Security utilities for BoDiGi app
 * Sanitization, validation, and protection against common attacks
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes dangerous HTML/script tags while preserving safe formatting
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return input;
  
  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe/gi, '&lt;iframe')
    .replace(/<object/gi, '&lt;object')
    .replace(/<embed/gi, '&lt;embed');
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize prompt for LLM to prevent prompt injection
 */
export function sanitizeLLMPrompt(userInput) {
  if (!userInput || typeof userInput !== 'string') return userInput;
  
  // Remove potential prompt injection patterns
  let sanitized = userInput
    .replace(/ignore\s+(previous|all|above)\s+(instructions?|commands?|prompts?)/gi, '[FILTERED]')
    .replace(/system\s*:/gi, '[FILTERED]:')
    .replace(/you\s+are\s+now/gi, '[FILTERED]')
    .replace(/forget\s+(everything|all|previous)/gi, '[FILTERED]')
    .replace(/new\s+instructions?:/gi, '[FILTERED]:')
    .trim();
  
  // Limit length to prevent token overflow attacks
  const MAX_PROMPT_LENGTH = 10000;
  if (sanitized.length > MAX_PROMPT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_PROMPT_LENGTH);
  }
  
  return sanitized;
}

/**
 * Rate limiting helper using localStorage
 * @param {string} key - Unique key for this action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if action is allowed, false if rate limited
 */
export function checkRateLimit(key, maxAttempts = 10, windowMs = 60000) {
  try {
    const now = Date.now();
    const rateLimitKey = `ratelimit_${key}`;
    const stored = localStorage.getItem(rateLimitKey);
    
    if (!stored) {
      localStorage.setItem(rateLimitKey, JSON.stringify({
        attempts: 1,
        resetAt: now + windowMs
      }));
      return true;
    }
    
    const data = JSON.parse(stored);
    
    // Reset if window expired
    if (now > data.resetAt) {
      localStorage.setItem(rateLimitKey, JSON.stringify({
        attempts: 1,
        resetAt: now + windowMs
      }));
      return true;
    }
    
    // Check if limit exceeded
    if (data.attempts >= maxAttempts) {
      return false;
    }
    
    // Increment attempts
    localStorage.setItem(rateLimitKey, JSON.stringify({
      attempts: data.attempts + 1,
      resetAt: data.resetAt
    }));
    
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Fail open to not block legitimate users
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file, options = {}) {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
  } = options;
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    };
  }
  
  // Check file extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension ${ext} is not allowed`
    };
  }
  
  return { valid: true };
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data) {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'api_key', 'apiKey', 'secret', 
    'credit_card', 'creditCard', 'ssn', 'social_security'
  ];
  
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  }
  
  return masked;
}

/**
 * Validate admin access
 * @param {object} user - User object
 * @returns {boolean} - true if user is admin
 */
export function isAdmin(user) {
  return user?.role === 'admin' && user?.email === 'support@bodigi-digital.com';
}

/**
 * Secure comparison to prevent timing attacks
 */
export function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate JSON structure
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prevent clickjacking - check if app is in iframe
 */
export function detectFraming() {
  if (window.self !== window.top) {
    console.warn('Security: App loaded in iframe');
    return true;
  }
  return false;
}

/**
 * Sanitize object for safe storage
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}