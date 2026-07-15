import { intentKeywordMap, intentPriority, normalizeText } from './synonyms'
import { ChatbotIntent, IntentDetectionResult, IntentEntities } from './types'

const regexMatchers: Array<{ intent: ChatbotIntent; patterns: RegExp[] }> = [
  {
    intent: ChatbotIntent.MOST_COMPLAINED_HALL,
    patterns: [
      /most\s+complained\s+lecture\s+hall/,
      /most\s+complained\s+hall/,
      /highest\s+complaint\w*\s+hall/,
      /hall\s+with\s+most\s+complaints?/,
      /which\s+hall\s+has\s+(the\s+)?(most|highest)\s+complaints?/,
      /wadipurama\s+complaints\s+hambuna\s+hall\s+eka/,
    ],
  },
  {
    intent: ChatbotIntent.COMPLAINT_SUMMARY,
    patterns: [
      /complaint\s+summary/,
      /summary\s+of\s+complaints?/,
      /complaints?\s+overview/,
      /give\s+me\s+a\s+complaint\s+summary/,
      /show\s+complaint\s+summary/,
    ],
  },
  {
    intent: ChatbotIntent.PENDING_COUNT,
    patterns: [
      /pending\s+complaints?/,
      /show\s+pending\s+complaints?/,
      /how\s+many\s+pending\s+complaints?/,
      /pending\s+count/,
    ],
  },
  {
    intent: ChatbotIntent.RESOLVED_COUNT,
    patterns: [
      /resolved\s+complaints?/,
      /how\s+many\s+resolved\s+complaints?/,
      /resolved\s+count/,
    ],
  },
  {
    intent: ChatbotIntent.FREE_LECTURE_HALLS,
    patterns: [/free\s+lecture\s+halls?/, /available\s+lecture\s+halls?/, /empty\s+halls?\s+now/],
  },
  {
    intent: ChatbotIntent.MOST_CROWDED_STUDY_AREA,
    patterns: [/most\s+crowded\s+study\s+area/, /busiest\s+study\s+area/, /crowded\s+study\s+area/],
  },
  {
    intent: ChatbotIntent.COMPLAINTS_BY_HALL,
    patterns: [/complaints?\s+for\s+hall/, /show\s+complaints?\s+for\s+hall/, /complaints?\s+by\s+hall/],
  },
  {
    intent: ChatbotIntent.COMPLAINT_STATUS_BY_ID,
    patterns: [
      /status\s+of\s+complaint\s+#\d+/,
      /check\s+complaint\s+#\d+/,
      /complaint\s+#\d+\s+status/,
      /complaint\s+\d+\s+status/,
      /status\s+of\s+complaint\s+\d+/,
    ],
  },
  {
    intent: ChatbotIntent.MY_COMPLAINT_STATUS,
    patterns: [/my\s+complaint\s+status/, /status\s+of\s+my\s+complaint/, /mage\s+complaint\s+eka\s+dan\s+mokakda/],
  },
  {
    intent: ChatbotIntent.TODAY_SUMMARY,
    patterns: [/today('?s)?\s+complaint\s+summary/, /today\s+summary/, /complaints?\s+today/],
  },
]

function extractEntities(normalizedMessage: string): IntentEntities {
  const entities: IntentEntities = {}

  const complaintMatch = normalizedMessage.match(/(?:complaint\s*(?:id)?\s*#\s*|complaint\s*(?:id)?\s+|#)(\d{1,10})/)
  if (complaintMatch) {
    entities.complaintId = Number.parseInt(complaintMatch[1], 10)
  }

  const hallCodeMatch = normalizedMessage.match(/\b([a-z]\d{3,4})\b/i)
  if (hallCodeMatch) {
    entities.hallQuery = hallCodeMatch[1].toUpperCase()
  } else {
    const hallPhraseMatch = normalizedMessage.match(/hall\s+([a-z0-9-]+)/i)
    if (hallPhraseMatch?.[1]) {
      entities.hallQuery = hallPhraseMatch[1].toUpperCase()
    }
  }

  entities.asksMyComplaintStatus =
    normalizedMessage.includes('my complaint') ||
    normalizedMessage.includes('my status') ||
    normalizedMessage.includes('mage complaint')

  return entities
}

function keywordScore(message: string, keywords: string[]): number {
  if (keywords.length === 0) return 0

  let best = 0
  for (const keyword of keywords) {
    const tokens = keyword.split(' ').filter(Boolean)
    if (tokens.length === 0) continue

    let matched = 0
    for (const token of tokens) {
      if (message.includes(token)) {
        matched += 1
      }
    }

    best = Math.max(best, matched / tokens.length)
  }

  return best
}

export function detectIntent(message: string): IntentDetectionResult {
  const normalizedMessage = normalizeText(message)
  const entities = extractEntities(normalizedMessage)

  const orderedMatchers = intentPriority
    .filter((intent) => intent !== ChatbotIntent.UNKNOWN)
    .map((intent) => regexMatchers.find((matcher) => matcher.intent === intent))
    .filter((matcher): matcher is { intent: ChatbotIntent; patterns: RegExp[] } => Boolean(matcher))

  for (const matcher of orderedMatchers) {
    if (matcher.intent === ChatbotIntent.COMPLAINT_STATUS_BY_ID && !entities.complaintId) {
      continue
    }

    if (matcher.intent === ChatbotIntent.MY_COMPLAINT_STATUS) {
      if (entities.asksMyComplaintStatus) {
        return {
          intent: matcher.intent,
          confidence: 0.96,
          normalizedMessage,
          entities,
        }
      }
      continue
    }

    if (matcher.patterns.some((pattern) => pattern.test(normalizedMessage))) {
      return {
        intent: matcher.intent,
        confidence: 0.92,
        normalizedMessage,
        entities,
      }
    }
  }

  let bestIntent: ChatbotIntent = ChatbotIntent.UNKNOWN
  let bestScore = 0

  for (const intent of intentPriority) {
    if (intent === ChatbotIntent.UNKNOWN) continue
    if (intent === ChatbotIntent.COMPLAINT_STATUS_BY_ID && !entities.complaintId) continue
    if (intent === ChatbotIntent.MY_COMPLAINT_STATUS && !entities.asksMyComplaintStatus) continue
    const score = keywordScore(normalizedMessage, intentKeywordMap[intent])
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  if (bestScore >= 0.45) {
    return {
      intent: bestIntent,
      confidence: bestScore,
      normalizedMessage,
      entities,
    }
  }

  return {
    intent: ChatbotIntent.UNKNOWN,
    confidence: 0,
    normalizedMessage,
    entities,
  }
}
