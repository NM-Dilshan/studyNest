export enum AdminChatIntent {
  MOST_COMPLAINED_HALL = 'MOST_COMPLAINED_HALL',
  COMPLAINT_SUMMARY = 'COMPLAINT_SUMMARY',
  PENDING_COUNT = 'PENDING_COUNT',
  RESOLVED_COUNT = 'RESOLVED_COUNT',
  STATUS_BREAKDOWN = 'STATUS_BREAKDOWN',
  TOP_ISSUE_CATEGORY = 'TOP_ISSUE_CATEGORY',
  TODAY_SUMMARY = 'TODAY_SUMMARY',
  HALL_WISE_COUNTS = 'HALL_WISE_COUNTS',
  UNKNOWN = 'UNKNOWN',
}

export interface IntentMatchResult {
  intent: AdminChatIntent;
  normalizedMessage: string;
}

const intentMatchers: Array<{
  intent: AdminChatIntent;
  patterns: RegExp[];
}> = [
  {
    intent: AdminChatIntent.MOST_COMPLAINED_HALL,
    patterns: [
      /most\s+complained\s+hall/i,
      /highest\s+number\s+of\s+complaints/i,
      /top\s+hall/i,
      /which\s+hall\s+has\s+the\s+most/i,
    ],
  },
  {
    intent: AdminChatIntent.COMPLAINT_SUMMARY,
    patterns: [
      /complaint\s+summary/i,
      /summary\s+of\s+complaints/i,
      /overall\s+complaints/i,
      /dashboard\s+summary/i,
    ],
  },
  {
    intent: AdminChatIntent.PENDING_COUNT,
    patterns: [
      /pending\s+complaints?/i,
      /how\s+many\s+pending/i,
      /pending\s+count/i,
    ],
  },
  {
    intent: AdminChatIntent.RESOLVED_COUNT,
    patterns: [
      /resolved\s+complaints?/i,
      /how\s+many\s+resolved/i,
      /resolved\s+count/i,
    ],
  },
  {
    intent: AdminChatIntent.STATUS_BREAKDOWN,
    patterns: [
      /complaint\s+count\s+by\s+status/i,
      /status\s+breakdown/i,
      /counts?\s+by\s+status/i,
      /show\s+status\s+counts?/i,
    ],
  },
  {
    intent: AdminChatIntent.TOP_ISSUE_CATEGORY,
    patterns: [
      /top\s+issue\s+category/i,
      /issue\s+category\s+appears\s+most/i,
      /most\s+common\s+issue/i,
      /highest\s+issue\s+category/i,
    ],
  },
  {
    intent: AdminChatIntent.TODAY_SUMMARY,
    patterns: [
      /summary\s+for\s+today/i,
      /today\s+summary/i,
      /today'?s\s+complaints?/i,
      /complaints?\s+today/i,
    ],
  },
  {
    intent: AdminChatIntent.HALL_WISE_COUNTS,
    patterns: [
      /hall[-\s]?wise\s+complaint\s+counts?/i,
      /complaint\s+count\s+by\s+hall/i,
      /show\s+hall\s+wise/i,
      /counts?\s+per\s+hall/i,
    ],
  },
];

export function detectIntent(message: string): IntentMatchResult {
  const normalizedMessage = message.trim().toLowerCase();

  for (const matcher of intentMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(normalizedMessage))) {
      return { intent: matcher.intent, normalizedMessage };
    }
  }

  return {
    intent: AdminChatIntent.UNKNOWN,
    normalizedMessage,
  };
}
