/**
 * Volunteer Level-Up System Utilities
 *
 * This module contains all calculations for the volunteer gamification system:
 * - Point calculation from responses and feedback
 * - Level determination from total points
 * - Progress calculation to next level
 */

/**
 * Point Rules Configuration
 */
export const POINT_RULES = {
  // Points for each response submission
  RESPONSE_POINTS: 5,

  // Bonus points based on feedback star rating
  FEEDBACK_POINTS: {
    5: 10,
    4: 7,
    3: 5,
    2: 2,
    1: 0,
  },
} as const;

/**
 * Level Configuration
 * Maps point ranges to volunteer levels
 */
export const LEVEL_CONFIG = {
  1: { min: 0, max: 49, title: "Beginner" },
  2: { min: 50, max: 99, title: "Contributor" },
  3: { min: 100, max: 199, title: "Expert" },
  4: { min: 200, max: 349, title: "Master" },
  5: { min: 350, max: Infinity, title: "Legend" },
} as const;

export type VolunteerLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Calculate points earned from volunteer responses
 * @param responseCount - Total number of responses submitted
 * @returns Points earned from responses
 */
export function calculateResponsePoints(responseCount: number): number {
  return responseCount * POINT_RULES.RESPONSE_POINTS;
}

/**
 * Calculate bonus points from a single feedback rating
 * @param stars - Star rating (1-5)
 * @returns Bonus points for this rating
 */
export function calculateFeedbackPoints(stars: number): number {
  if (stars < 1 || stars > 5) return 0;
  return POINT_RULES.FEEDBACK_POINTS[stars as keyof typeof POINT_RULES.FEEDBACK_POINTS];
}

/**
 * Calculate total bonus points from all feedback
 * @param feedbackArray - Array of star ratings
 * @returns Total bonus points from all feedback
 */
export function calculateTotalFeedbackPoints(feedbackArray: number[]): number {
  return feedbackArray.reduce((total, stars) => total + calculateFeedbackPoints(stars), 0);
}

/**
 * Calculate total points from responses and feedback
 * @param responseCount - Number of responses submitted
 * @param feedbackArray - Array of star ratings received
 * @returns Total points
 */
export function calculateTotalPoints(responseCount: number, feedbackArray: number[] = []): number {
  const responsePoints = calculateResponsePoints(responseCount);
  const feedbackPoints = calculateTotalFeedbackPoints(feedbackArray);
  return responsePoints + feedbackPoints;
}

/**
 * Determine volunteer level from total points
 * @param totalPoints - Total points earned
 * @returns Volunteer level (1-5)
 */
export function getLevelFromPoints(totalPoints: number): VolunteerLevel {
  if (totalPoints >= LEVEL_CONFIG[5].min) return 5;
  if (totalPoints >= LEVEL_CONFIG[4].min) return 4;
  if (totalPoints >= LEVEL_CONFIG[3].min) return 3;
  if (totalPoints >= LEVEL_CONFIG[2].min) return 2;
  return 1;
}

/**
 * Get level title from level number
 * @param level - Volunteer level
 * @returns Level title (e.g., "Master")
 */
export function getLevelTitle(level: VolunteerLevel): string {
  return LEVEL_CONFIG[level].title;
}

/**
 * Calculate progress to next level
 * @param totalPoints - Current total points
 * @returns Progress object with current, next level info and percentage
 */
export interface LevelProgressInfo {
  currentLevel: VolunteerLevel;
  currentLevelTitle: string;
  nextLevel: VolunteerLevel | null;
  nextLevelTitle: string | null;
  currentLevelMin: number;
  nextLevelMin: number | null;
  pointsInCurrentLevel: number;
  pointsNeededForNextLevel: number | null;
  progressPercentage: number; // 0-100
  totalPoints: number;
}

export function calculateLevelProgress(totalPoints: number): LevelProgressInfo {
  const currentLevel = getLevelFromPoints(totalPoints);
  const levelConfig = LEVEL_CONFIG[currentLevel];
  const nextLevel = (currentLevel < 5 ? (currentLevel + 1) : null) as VolunteerLevel | null;
  const nextLevelConfig = nextLevel ? LEVEL_CONFIG[nextLevel] : null;

  const pointsInCurrentLevel = totalPoints - levelConfig.min;
  const pointsNeededForNextLevel = nextLevelConfig 
    ? nextLevelConfig.min - totalPoints 
    : null;
  
  const pointsAvailableInLevel = nextLevelConfig 
    ? nextLevelConfig.min - levelConfig.min - 1 
    : 0;
  
  const progressPercentage = nextLevelConfig 
    ? Math.min(((pointsInCurrentLevel) / pointsAvailableInLevel) * 100, 100)
    : 100;

  return {
    currentLevel,
    currentLevelTitle: getLevelTitle(currentLevel),
    nextLevel,
    nextLevelTitle: nextLevel ? getLevelTitle(nextLevel) : null,
    currentLevelMin: levelConfig.min,
    nextLevelMin: nextLevelConfig?.min ?? null,
    pointsInCurrentLevel,
    pointsNeededForNextLevel,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    totalPoints,
  };
}

/**
 * Get all level information
 */
export function getAllLevelInfo() {
  return LEVEL_CONFIG;
}

/**
 * Volunteer Stats Summary - combines all stats
 */
export interface VolunteerStatsComplete {
  volunteer_id: string;
  name: string;
  volunteer_id_num: string;
  
  // Response stats
  total_responses: number;
  
  // Feedback stats
  total_feedback: number;
  average_rating: number;
  feedback_breakdown: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  
  // Points and level
  total_points: number;
  level: VolunteerLevel;
  level_title: string;
  level_progress: LevelProgressInfo;
}
