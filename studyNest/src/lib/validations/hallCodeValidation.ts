/**
 * Validation utilities for lecture hall codes
 * Format: [A-G][0-9]{4}
 * Examples: A0103, G1210, F1203, C0326
 */

/**
 * Validation result type for detailed error reporting
 */
export interface ValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Validates a complete lecture hall code
 * @param code - The hall code to validate (e.g., "A0103")
 * @returns true if the code is valid, false otherwise
 */
export function isValidHallCode(code: string): boolean {
  const fullRegex = /^[A-G][0-9]{4}$/;
  return fullRegex.test(code);
}

/**
 * Validates a partial lecture hall code (while typing)
 * @param code - The partial hall code being entered
 * @returns true if the code is a valid partial format, false otherwise
 */
export function isValidPartialHallCode(code: string): boolean {
  const partialRegex = /^[A-G]([0-9]{0,4})?$/;
  return partialRegex.test(code);
}

/**
 * Validates hall code and returns detailed error messages
 * Allows free typing and provides live validation feedback
 * @param input - The raw input from the user (will be converted to uppercase)
 * @returns ValidationResult with isValid flag and error message
 */
export function validateHallCode(input: string): ValidationResult {
  // Always convert to uppercase for display consistency
  const normalized = input.toUpperCase();

  // Empty input is not valid for submission but don't show error while typing
  if (!normalized) {
    return {
      isValid: false,
      error: 'Lecture hall code is required',
    };
  }

  // Check total length
  if (normalized.length > 5) {
    return {
      isValid: false,
      error: 'Lecture hall code must be exactly 5 characters (A-G + 4 digits)',
    };
  }

  // Check first character
  const firstChar = normalized.charAt(0);
  if (!/^[A-G]$/.test(firstChar)) {
    return {
      isValid: false,
      error: 'First character must be a letter from A to G',
    };
  }

  // Check remaining characters (must be digits)
  if (normalized.length > 1) {
    const remaining = normalized.substring(1);
    if (!/^[0-9]*$/.test(remaining)) {
      return {
        isValid: false,
        error: 'Characters after the first letter must be digits only',
      };
    }

    // Check if incomplete but on the right track
    if (normalized.length < 5) {
      const digitsNeeded = 5 - normalized.length;
      return {
        isValid: false,
        error: `Incomplete code (${digitsNeeded} digit${digitsNeeded > 1 ? 's' : ''} remaining)`,
      };
    }
  } else if (normalized.length === 1) {
    // Just the letter, need digits
    return {
      isValid: false,
      error: 'Enter 4 digits after the letter (e.g., A0103)',
    };
  }

  // All checks passed - code is complete and valid
  return {
    isValid: true,
    error: '',
  };
}

/**
 * Gets the expected format description for error messages
 * @returns A string describing the expected format
 */
export function getFormatHelpText(): string {
  return 'Format: A0103 (A-G + 4 digits)';
}

/**
 * Determines if a partial code should allow search
 * @param code - The partial hall code
 * @returns true if search should be triggered, false otherwise
 */
export function shouldTriggerSearch(code: string): boolean {
  // Only trigger search if:
  // 1. Code is at least 1 character (just the building letter)
  // 2. Code matches the partial pattern
  return code.length >= 1 && isValidPartialHallCode(code);
}

/**
 * Checks if a code is complete and ready for exact matching
 * @param code - The hall code to check
 * @returns true if the code is complete (5 chars), false otherwise
 */
export function isCompleteHallCode(code: string): boolean {
  return code.length === 5 && isValidHallCode(code);
}
