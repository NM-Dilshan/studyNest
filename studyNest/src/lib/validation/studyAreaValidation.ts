/**
 * StudyNest Study Area Validation Schema
 * Comprehensive validation for study area creation and updates
 */

// Validation constants
export const STUDY_AREA_VALIDATION = {
  AREA_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9\s\-]*$/, // Letters, numbers, spaces, hyphens only
  },
  BUILDING: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  FLOOR: {
    MIN: -10, // Support basement floors
    MAX: 100,
  },
  CAPACITY: {
    MIN: 1,
    MAX: 2000,
  },
  LATITUDE: {
    MIN: -90,
    MAX: 90,
  },
  LONGITUDE: {
    MIN: -180,
    MAX: 180,
  },
  RADIUS_METERS: {
    MIN: 5,
    MAX: 200,
    DEFAULT: 20,
  },
  STATUS: {
    VALID_OPTIONS: [
      'available',
      'low_crowd',
      'medium_crowd',
      'high_crowd',
      'closed',
    ],
    DISPLAY_OPTIONS: [
      { value: 'available', label: 'Available' },
      { value: 'low_crowd', label: 'Low Crowd' },
      { value: 'medium_crowd', label: 'Medium Crowd' },
      { value: 'high_crowd', label: 'High Crowd' },
      { value: 'closed', label: 'Closed' },
    ],
  },
}

// Type definitions
export interface StudyAreaFormData {
  area_name: string
  building: string
  floor: string
  capacity: string
  latitude: string
  longitude: string
  radius_meters: string
  area_status: string
  wifi: boolean
  charging_ports: boolean
  silent_zone: boolean
  ac: boolean
}

export interface ValidationErrors {
  [key: string]: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

/**
 * Validate area name
 * - Required
 * - Length: 3-100 characters
 * - Pattern: Letters, numbers, spaces, hyphens only
 */
export function validateAreaName(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Area name is required'
  }

  if (trimmed.length < STUDY_AREA_VALIDATION.AREA_NAME.MIN_LENGTH) {
    return `Area name must be at least ${STUDY_AREA_VALIDATION.AREA_NAME.MIN_LENGTH} characters`
  }

  if (trimmed.length > STUDY_AREA_VALIDATION.AREA_NAME.MAX_LENGTH) {
    return `Area name must not exceed ${STUDY_AREA_VALIDATION.AREA_NAME.MAX_LENGTH} characters`
  }

  if (!STUDY_AREA_VALIDATION.AREA_NAME.PATTERN.test(trimmed)) {
    return 'Area name contains invalid characters. Use only letters, numbers, spaces, and hyphens'
  }

  return null
}

/**
 * Validate building name
 * - Required
 * - Length: 2-50 characters
 */
export function validateBuilding(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Building is required'
  }

  if (trimmed.length < STUDY_AREA_VALIDATION.BUILDING.MIN_LENGTH) {
    return `Building must be at least ${STUDY_AREA_VALIDATION.BUILDING.MIN_LENGTH} characters`
  }

  if (trimmed.length > STUDY_AREA_VALIDATION.BUILDING.MAX_LENGTH) {
    return `Building must not exceed ${STUDY_AREA_VALIDATION.BUILDING.MAX_LENGTH} characters`
  }

  return null
}

/**
 * Validate floor number
 * - Required
 * - Must be an integer
 * - Supports basement floors (e.g., -2)
 */
export function validateFloor(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Floor is required'
  }

  const floorNum = parseInt(trimmed, 10)

  if (isNaN(floorNum)) {
    return 'Floor must be a valid whole number'
  }

  if (
    floorNum < STUDY_AREA_VALIDATION.FLOOR.MIN ||
    floorNum > STUDY_AREA_VALIDATION.FLOOR.MAX
  ) {
    return `Floor must be between ${STUDY_AREA_VALIDATION.FLOOR.MIN} and ${STUDY_AREA_VALIDATION.FLOOR.MAX}`
  }

  return null
}

/**
 * Validate capacity
 * - Required
 * - Must be numeric
 * - Must be greater than 0
 * - Maximum 2000
 */
export function validateCapacity(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Capacity is required'
  }

  const capacity = parseInt(trimmed, 10)

  if (isNaN(capacity)) {
    return 'Capacity must be a valid number'
  }

  if (capacity < STUDY_AREA_VALIDATION.CAPACITY.MIN) {
    return `Capacity must be greater than 0`
  }

  if (capacity > STUDY_AREA_VALIDATION.CAPACITY.MAX) {
    return `Capacity must not exceed ${STUDY_AREA_VALIDATION.CAPACITY.MAX}`
  }

  return null
}

/**
 * Validate area status
 * - Required
 * - Must be one of predefined options
 */
export function validateStatus(value: string): string | null {
  if (!value) {
    return 'Status is required'
  }

  if (!STUDY_AREA_VALIDATION.STATUS.VALID_OPTIONS.includes(value)) {
    return 'Invalid status selected'
  }

  return null
}

/**
 * Validate latitude
 * - Required
 * - Must be a decimal number
 * - Range: -90 to 90
 */
export function validateLatitude(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Latitude is required'
  }

  const lat = parseFloat(trimmed)

  if (isNaN(lat)) {
    return 'Latitude must be a valid decimal number'
  }

  if (lat < STUDY_AREA_VALIDATION.LATITUDE.MIN || lat > STUDY_AREA_VALIDATION.LATITUDE.MAX) {
    return `Latitude must be between ${STUDY_AREA_VALIDATION.LATITUDE.MIN} and ${STUDY_AREA_VALIDATION.LATITUDE.MAX}`
  }

  return null
}

/**
 * Validate longitude
 * - Required
 * - Must be a decimal number
 * - Range: -180 to 180
 */
export function validateLongitude(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Longitude is required'
  }

  const lon = parseFloat(trimmed)

  if (isNaN(lon)) {
    return 'Longitude must be a valid decimal number'
  }

  if (lon < STUDY_AREA_VALIDATION.LONGITUDE.MIN || lon > STUDY_AREA_VALIDATION.LONGITUDE.MAX) {
    return `Longitude must be between ${STUDY_AREA_VALIDATION.LONGITUDE.MIN} and ${STUDY_AREA_VALIDATION.LONGITUDE.MAX}`
  }

  return null
}

/**
 * Validate geofence radius
 * - Required
 * - Must be numeric
 * - Must be greater than 0
 * - Recommended range: 5-200 meters
 */
export function validateRadiusMeters(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return 'Geofence radius is required'
  }

  const radius = parseInt(trimmed, 10)

  if (isNaN(radius)) {
    return 'Geofence radius must be a valid number'
  }

  if (radius < STUDY_AREA_VALIDATION.RADIUS_METERS.MIN) {
    return `Geofence radius must be at least ${STUDY_AREA_VALIDATION.RADIUS_METERS.MIN} meters`
  }

  if (radius > STUDY_AREA_VALIDATION.RADIUS_METERS.MAX) {
    return `Geofence radius must not exceed ${STUDY_AREA_VALIDATION.RADIUS_METERS.MAX} meters`
  }

  return null
}

/**
 * Validate cross-field conditions
 * - If latitude is entered, longitude must also be entered
 * - If longitude is entered, latitude must also be entered
 */
export function validateCrossFields(
  latitude: string,
  longitude: string
): string | null {
  const latTrimmed = latitude.trim()
  const lonTrimmed = longitude.trim()

  if ((latTrimmed && !lonTrimmed) || (!latTrimmed && lonTrimmed)) {
    return 'Both latitude and longitude must be provided'
  }

  return null
}

/**
 * Validate entire form data
 * Returns ValidationResult with all errors
 */
export function validateFormData(data: StudyAreaFormData): ValidationResult {
  const errors: ValidationErrors = {}

  // Validate individual fields
  const areaNameError = validateAreaName(data.area_name)
  if (areaNameError) errors.area_name = areaNameError

  const buildingError = validateBuilding(data.building)
  if (buildingError) errors.building = buildingError

  const floorError = validateFloor(data.floor)
  if (floorError) errors.floor = floorError

  const capacityError = validateCapacity(data.capacity)
  if (capacityError) errors.capacity = capacityError

  const statusError = validateStatus(data.area_status)
  if (statusError) errors.area_status = statusError

  const latitudeError = validateLatitude(data.latitude)
  if (latitudeError) errors.latitude = latitudeError

  const longitudeError = validateLongitude(data.longitude)
  if (longitudeError) errors.longitude = longitudeError

  const radiusError = validateRadiusMeters(data.radius_meters)
  if (radiusError) errors.radius_meters = radiusError

  // Validate cross-field conditions
  const crossFieldError = validateCrossFields(data.latitude, data.longitude)
  if (crossFieldError && !errors.latitude && !errors.longitude) {
    errors._cross = crossFieldError
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Trim all string fields in form data
 */
export function trimFormData(data: StudyAreaFormData): StudyAreaFormData {
  return {
    ...data,
    area_name: data.area_name.trim(),
    building: data.building.trim(),
    floor: data.floor.trim(),
    capacity: data.capacity.trim(),
    latitude: data.latitude.trim(),
    longitude: data.longitude.trim(),
    radius_meters: data.radius_meters.trim(),
  }
}

/**
 * Convert form data to API payload
 */
export function formDataToPayload(data: StudyAreaFormData) {
  return {
    name: data.area_name.trim(),
    building: data.building.trim(),
    floor: data.floor ? parseInt(data.floor, 10) : null,
    capacity: data.capacity ? parseInt(data.capacity, 10) : null,
    status: data.area_status,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    radiusMeters: data.radius_meters ? parseInt(data.radius_meters, 10) : STUDY_AREA_VALIDATION.RADIUS_METERS.DEFAULT,
    facilities: {
      wifi: data.wifi,
      chargingPorts: data.charging_ports,
      silentZone: data.silent_zone,
      ac: data.ac,
    },
  }
}
