import { ChatbotIntent } from './types'

const phraseReplacements: Array<{ from: RegExp; to: string }> = [
  { from: /wadipurama/g, to: 'most' },
  { from: /wedi(g|y)?purama/g, to: 'most' },
  { from: /hambuna/g, to: 'received' },
  { from: /m(ok|o)kakda/g, to: 'what' },
  { from: /eka/g, to: 'the' },
  { from: /free halls/g, to: 'free lecture halls' },
  { from: /complain(ed|ts)?/g, to: 'complaint' },
]

export function normalizeText(message: string): string {
  let normalized = message.toLowerCase().trim()

  for (const replacement of phraseReplacements) {
    normalized = normalized.replace(replacement.from, replacement.to)
  }

  return normalized
    .replace(/[^a-z0-9#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const intentKeywordMap: Record<ChatbotIntent, string[]> = {
  [ChatbotIntent.MOST_COMPLAINED_HALL]: [
    'most complained lecture hall',
    'most complained hall',
    'highest complaint hall',
    'hall with most complaints',
    'which hall has the most complaints',
    'wadipurama complaints hambuna hall eka',
    'wadipurama complaints hambuna hall',
  ],
  [ChatbotIntent.COMPLAINT_SUMMARY]: [
    'complaint summary',
    'give me a complaint summary',
    'show complaint summary',
    'summary of complaints',
    'complaints overview',
    'overall complaints',
  ],
  [ChatbotIntent.PENDING_COUNT]: [
    'pending complaints',
    'show pending complaints',
    'how many pending complaints',
    'pending count',
  ],
  [ChatbotIntent.RESOLVED_COUNT]: [
    'resolved complaints',
    'how many resolved complaints',
    'resolved count',
  ],
  [ChatbotIntent.FREE_LECTURE_HALLS]: [
    'free lecture halls',
    'available lecture halls',
    'empty halls now',
    'show free halls',
  ],
  [ChatbotIntent.MOST_CROWDED_STUDY_AREA]: [
    'most crowded study area',
    'busiest study area',
    'crowded study area',
    'highest occupancy study area',
  ],
  [ChatbotIntent.COMPLAINTS_BY_HALL]: [
    'complaints for hall',
    'show complaints for hall',
    'complaints by hall',
    'hall complaint list',
  ],
  [ChatbotIntent.COMPLAINT_STATUS_BY_ID]: [
    'status of complaint',
    'complaint status',
    'check complaint',
    'complaint status by id',
  ],
  [ChatbotIntent.MY_COMPLAINT_STATUS]: [
    'my complaint status',
    'status of my complaint',
    'mage complaint eka dan mokakda',
    'my complaint',
  ],
  [ChatbotIntent.TODAY_SUMMARY]: [
    'today summary',
    'todays complaint summary',
    'complaints today',
    'today complaint analytics',
  ],
  [ChatbotIntent.UNKNOWN]: [],
}

export const intentPriority: ChatbotIntent[] = [
  ChatbotIntent.MOST_COMPLAINED_HALL,
  ChatbotIntent.COMPLAINT_SUMMARY,
  ChatbotIntent.PENDING_COUNT,
  ChatbotIntent.RESOLVED_COUNT,
  ChatbotIntent.FREE_LECTURE_HALLS,
  ChatbotIntent.MOST_CROWDED_STUDY_AREA,
  ChatbotIntent.COMPLAINTS_BY_HALL,
  ChatbotIntent.COMPLAINT_STATUS_BY_ID,
  ChatbotIntent.MY_COMPLAINT_STATUS,
  ChatbotIntent.TODAY_SUMMARY,
  ChatbotIntent.UNKNOWN,
]
