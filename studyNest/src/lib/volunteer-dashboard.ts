/**
 * Volunteer Dashboard Calculations
 */

export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 50,
  3: 100,
  4: 200,
  5: 350,
} as const;

export const MAX_LEVEL = 5;

/**
 * Get level from total points
 */
export function getLevelFromPoints(points: number): number {
  if (points >= LEVEL_THRESHOLDS[5]) return 5;
  if (points >= LEVEL_THRESHOLDS[4]) return 4;
  if (points >= LEVEL_THRESHOLDS[3]) return 3;
  if (points >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

/**
 * Get next level target
 */
export function getNextLevelTarget(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL];
  return LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS];
}

/**
 * Calculate points remaining to next level
 */
export function getPointsToNextLevel(currentPoints: number, currentLevel: number): number {
  const nextTarget = getNextLevelTarget(currentLevel);
  const remaining = Math.max(0, nextTarget - currentPoints);
  return remaining;
}

/**
 * Estimate responses needed for next level
 * Assuming 5 points per response
 */
export function estimateResponsesNeeded(pointsRemaining: number): number {
  return Math.ceil(pointsRemaining / 5);
}

/**
 * Get color for level badge
 */
export function getLevelColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-gray-100 text-gray-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-purple-100 text-purple-800';
    case 4:
      return 'bg-orange-100 text-orange-800';
    case 5:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get level name
 */
export function getLevelName(level: number): string {
  const names: Record<number, string> = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Expert',
    5: 'Master',
  };
  return names[level] || 'Unknown';
}

/**
 * Determine badges based on performance
 */
export interface VolunteerBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export function getBadges(
  totalResponses: number,
  averageRating: number,
  totalReviews: number,
  level: number
): VolunteerBadge[] {
  const badges: VolunteerBadge[] = [];

  if (totalResponses >= 50) {
    badges.push({
      id: 'top-contributor',
      name: 'Top Contributor',
      icon: '🏆',
      description: `${totalResponses} responses submitted`,
    });
  }

  if (averageRating >= 4.5 && totalReviews >= 5) {
    badges.push({
      id: 'highly-rated',
      name: 'Highly Rated',
      icon: '⭐',
      description: `${averageRating.toFixed(1)} average rating`,
    });
  }

  if (level >= 4) {
    badges.push({
      id: 'expert',
      name: 'Expert Volunteer',
      icon: '🎖️',
      description: `Reached Level ${level}`,
    });
  }

  if (totalReviews >= 100) {
    badges.push({
      id: 'community-favorite',
      name: 'Community Favorite',
      icon: '❤️',
      description: `${totalReviews} feedback received`,
    });
  }

  return badges;
}
