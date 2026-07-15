import { detectIntent } from './intentDetection'
import { ChatbotIntent } from './types'

export const chatbotIntentExamples = [
  { message: 'What is the most complained lecture hall?', expected: ChatbotIntent.MOST_COMPLAINED_HALL },
  { message: 'Which hall has the highest number of complaints?', expected: ChatbotIntent.MOST_COMPLAINED_HALL },
  { message: 'Wadipurama complaints hambuna lecture hall eka mokakda?', expected: ChatbotIntent.MOST_COMPLAINED_HALL },
  { message: 'Give me a complaint summary', expected: ChatbotIntent.COMPLAINT_SUMMARY },
  { message: 'Show pending complaints', expected: ChatbotIntent.PENDING_COUNT },
  { message: 'How many resolved complaints are there?', expected: ChatbotIntent.RESOLVED_COUNT },
  { message: 'What is the status of my complaint?', expected: ChatbotIntent.MY_COMPLAINT_STATUS },
  { message: 'Show complaints for Hall G0202', expected: ChatbotIntent.COMPLAINTS_BY_HALL },
  { message: 'Which study area is most crowded?', expected: ChatbotIntent.MOST_CROWDED_STUDY_AREA },
  { message: 'Show free lecture halls', expected: ChatbotIntent.FREE_LECTURE_HALLS },
  { message: 'Give me today’s complaint summary', expected: ChatbotIntent.TODAY_SUMMARY },
  { message: 'status of complaint #123', expected: ChatbotIntent.COMPLAINT_STATUS_BY_ID },
]

export function runChatbotIntentExamples(): Array<{ message: string; detected: ChatbotIntent; expected: ChatbotIntent }> {
  return chatbotIntentExamples.map((example) => ({
    message: example.message,
    detected: detectIntent(example.message).intent,
    expected: example.expected,
  }))
}
