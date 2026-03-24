/**
 * Validation logic for volunteer hall updates
 * Ensures data integrity and business rules compliance
 */

export type AvailabilityStatus = 'Free' | 'Partially Busy' | 'Busy'
export type OccupancyLevel = 'Empty' | 'Low' | 'Medium' | 'High' | 'Full'
export type ExpiryDuration = '30m' | '1h' | '2h' | 'custom'

export interface VolunteerHallUpdateInput {
  hallId: string
  availabilityStatus: AvailabilityStatus
  occupancyLevel: OccupancyLevel
  availableSeats?: number
  note?: string
  expiryDuration: ExpiryDuration
  expiryTime?: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: Map<string, string>
}

/**
 * Validate availability status
 */
export function validateAvailabilityStatus(status: string): boolean {
  const validStatuses: AvailabilityStatus[] = ['Free', 'Partially Busy', 'Busy']
  return validStatuses.includes(status as AvailabilityStatus)
}

/**
 * Validate occupancy level
 */
export function validateOccupancyLevel(level: string): boolean {
  const validLevels: OccupancyLevel[] = ['Empty', 'Low', 'Medium', 'High', 'Full']
  return validLevels.includes(level as OccupancyLevel)
}

/**
 * Validate available seats
 */
export function validateAvailableSeats(
  seats: number | undefined | null,
  hallCapacity: number | undefined | null,
  occupancyLevel: OccupancyLevel
): { isValid: boolean; error?: string } {
  if (seats === null || seats === undefined) {
    return { isValid: true } // optional field
  }

  if (seats < 0) {
    return { isValid: false, error: 'Available seats cannot be negative' }
  }

  if (hallCapacity && seats > hallCapacity) {
    return {
      isValid: false,
      error: `Available seats cannot exceed hall capacity (${hallCapacity})`,
    }
  }

  // Soft validation: if Full, seats should be 0
  if (occupancyLevel === 'Full' && seats > 0) {
    return {
      isValid: false,
      error: 'If occupancy is Full, available seats should be 0',
    }
  }

  // Soft validation: if Empty, seats should be high or near capacity
  if (occupancyLevel === 'Empty' && hallCapacity && seats < hallCapacity * 0.8) {
    // This is a warning but we allow it for now
    // Could be enhanced with a warning field
  }

  return { isValid: true }
}

/**
 * Validate expiry duration
 */
export function validateExpiryDuration(duration: string): boolean {
  const validDurations: ExpiryDuration[] = ['30m', '1h', '2h', 'custom']
  return validDurations.includes(duration as ExpiryDuration)
}

/**
 * Calculate expiry time from duration
 */
export function calculateExpiryTime(duration: ExpiryDuration, customTime?: Date): Date {
  const now = new Date()

  switch (duration) {
    case '30m':
      return new Date(now.getTime() + 30 * 60 * 1000)
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '2h':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000)
    case 'custom':
      if (!customTime) {
        throw new Error('Custom expiry time is required when duration is "custom"')
      }
      return customTime
    default:
      return new Date(now.getTime() + 60 * 60 * 1000) // default 1 hour
  }
}

/**
 * Validate expiry time is in the future
 */
export function validateExpiryTime(expiryTime: Date): { isValid: boolean; error?: string } {
  const now = new Date()

  if (expiryTime <= now) {
    return { isValid: false, error: 'Expiry time must be in the future' }
  }

  return { isValid: true }
}

/**
 * Check cooldown violation: same volunteer cannot submit for same hall within 15 minutes
 */
export function calculateCooldownRemaining(
  lastSubmitTime: Date | null | undefined
): { isOnCooldown: boolean; remainingSeconds: number } {
  if (!lastSubmitTime) {
    return { isOnCooldown: false, remainingSeconds: 0 }
  }

  const cooldownDuration = 15 * 60 * 1000 // 15 minutes in milliseconds
  const now = new Date()
  const timeSinceLastSubmit = now.getTime() - lastSubmitTime.getTime()

  if (timeSinceLastSubmit < cooldownDuration) {
    const remainingMs = cooldownDuration - timeSinceLastSubmit
    const remainingSeconds = Math.ceil(remainingMs / 1000)
    return { isOnCooldown: true, remainingSeconds }
  }

  return { isOnCooldown: false, remainingSeconds: 0 }
}

/**
 * Check if a submission is expired
 */
export function isSubmissionExpired(expiryTime: Date | null | undefined): boolean {
  if (!expiryTime) return false
  return new Date() > expiryTime
}

/**
 * Get remaining time for a submission
 */
export function getTimeRemaining(expiryTime: Date | null | undefined): {
  isExpired: boolean
  remainingMs: number
  displayText: string
} {
  if (!expiryTime) {
    return { isExpired: true, remainingMs: 0, displayText: 'No expiry set' }
  }

  const now = new Date()
  const remainingMs = expiryTime.getTime() - now.getTime()

  if (remainingMs <= 0) {
    return { isExpired: true, remainingMs: 0, displayText: 'Expired' }
  }

  // Convert to human-readable format
  const totalSeconds = Math.floor(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let displayText = ''
  if (hours > 0) {
    displayText = `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    displayText = `${minutes}m ${seconds}s`
  } else {
    displayText = `${seconds}s`
  }

  return { isExpired: false, remainingMs, displayText }
}

/**
 * Comprehensive validation for volunteer hall update input
 */
export function validateVolunteerHallUpdate(
  input: VolunteerHallUpdateInput,
  hallCapacity?: number | null
): ValidationResult {
  const errors = new Map<string, string>()

  // Validate hall ID
  if (!input.hallId || typeof input.hallId !== 'string') {
    errors.set('hallId', 'Lecture hall is required')
  }

  // Validate availability status
  if (!input.availabilityStatus || !validateAvailabilityStatus(input.availabilityStatus)) {
    errors.set('availabilityStatus', 'Valid availability status is required')
  }

  // Validate occupancy level
  if (!input.occupancyLevel || !validateOccupancyLevel(input.occupancyLevel)) {
    errors.set('occupancyLevel', 'Valid occupancy level is required')
  }

  // Validate available seats
  if (input.availableSeats !== null && input.availableSeats !== undefined) {
    const seatsValidation = validateAvailableSeats(
      input.availableSeats,
      hallCapacity,
      input.occupancyLevel as OccupancyLevel
    )
    if (!seatsValidation.isValid) {
      errors.set('availableSeats', seatsValidation.error || 'Invalid available seats')
    }
  }

  // Validate expiry duration
  if (!input.expiryDuration || !validateExpiryDuration(input.expiryDuration)) {
    errors.set('expiryDuration', 'Valid expiry duration is required')
  }

  // Validate custom expiry time if duration is 'custom'
  if (input.expiryDuration === 'custom') {
    if (!input.expiryTime) {
      errors.set('expiryTime', 'Custom expiry time is required')
    } else {
      const timeValidation = validateExpiryTime(input.expiryTime)
      if (!timeValidation.isValid) {
        errors.set('expiryTime', timeValidation.error || 'Invalid expiry time')
      }
    }
  }

  return {
    isValid: errors.size === 0,
    errors,
  }
}
