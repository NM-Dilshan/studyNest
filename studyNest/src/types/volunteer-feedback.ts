/**
 * TypeScript Types for Volunteer Feedback & Level-Up System
 */

// Volunteer Feedback
export interface VolunteerFeedback {
  feedback_id: string;
  response_id: string;
  request_id: string;
  given_by_user_id: string;
  stars: number;
  comment: string | null;
  created_at: Date;
}

// Volunteer Scores/Level Info
export interface VolunteerScore {
  score_id: number;
  volunteer_id: string;
  total_responses: number;
  total_feedback_received: number;
  average_feedback_rating: number;
  total_points: number;
  level: number;
  updated_at: Date;
}

// API Response Types
export interface FeedbackSubmissionRequest {
  response_id: string;
  request_id: string;
  user_id: string;
  stars: number;
  comment?: string | null;
}

export interface FeedbackSubmissionResponse {
  success: boolean;
  message?: string;
  data?: {
    feedback_id: string;
    stars: number;
    comment: string | null;
    created_at: string;
  };
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface VolunteerProfileResponse {
  success: boolean;
  data?: {
    volunteer_id: string;
    name: string;
    volunteer_id_num: string;
    total_responses: number;
    total_feedback: number;
    average_rating: number;
    feedback_breakdown: FeedbackBreakdown;
    total_points: number;
    level: number;
    level_title: string;
    level_progress: LevelProgressInfo;
  };
  error?: string;
}

// Feedback Breakdown
export interface FeedbackBreakdown {
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

// Level Progress
export interface LevelProgressInfo {
  currentLevel: number;
  currentLevelTitle: string;
  nextLevel: number | null;
  nextLevelTitle: string | null;
  currentLevelMin: number;
  nextLevelMin: number | null;
  pointsInCurrentLevel: number;
  pointsNeededForNextLevel: number | null;
  progressPercentage: number;
  totalPoints: number;
}

// Volunteer Stats Complete
export interface VolunteerStatsComplete {
  volunteer_id: string;
  name: string;
  volunteer_id_num: string;
  total_responses: number;
  total_feedback: number;
  average_rating: number;
  feedback_breakdown: FeedbackBreakdown;
  total_points: number;
  level: number;
  level_title: string;
  level_progress: LevelProgressInfo;
}

// Point System
export interface PointsConfig {
  RESPONSE_POINTS: number;
  FEEDBACK_POINTS: Record<number, number>;
}

// Level Config
export interface LevelRangeConfig {
  min: number;
  max: number;
  title: string;
}

export type LevelConfig = Record<number, LevelRangeConfig>;

// Validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T = unknown> {
  valid: boolean;
  errors: ValidationError[];
  data?: T;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}

// Generics for API responses
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
