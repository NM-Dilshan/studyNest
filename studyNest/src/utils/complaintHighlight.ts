/**
 * Scroll/highlight helpers for complaint cards.
 */

export async function scrollToComplaint(
	complaintId: number,
	options?: {
		behavior?: ScrollBehavior
		block?: ScrollLogicalPosition
		delay?: number
	}
) {
	const { behavior = 'smooth', block = 'center', delay = 100 } = options || {}

	await new Promise((resolve) => setTimeout(resolve, delay))

	const primary = document.getElementById(`complaint-${complaintId}`)
	const fallback = document.querySelector(`[data-complaint-ids*="|${complaintId}|"]`)
	const element = (primary || fallback) as HTMLElement | null

	if (!element) return false

	element.scrollIntoView({ behavior, block })
	addHighlightAnimation(element)
	return true
}

export function addHighlightAnimation(element: HTMLElement) {
	element.classList.remove('blink-highlight')
	element.classList.remove('subtle-highlight')

	// Restart animation class cleanly.
	void element.offsetWidth

	element.classList.add('blink-highlight')

	window.setTimeout(() => {
		element.classList.remove('blink-highlight')
		element.classList.add('subtle-highlight')
	}, 2000)

	window.setTimeout(() => {
		element.classList.remove('subtle-highlight')
	}, 5500)
}

export function getHighlightComplaintIdFromUrl() {
	if (typeof window === 'undefined') return null
	const params = new URLSearchParams(window.location.search)
	const value = Number(params.get('highlight'))
	if (!value || Number.isNaN(value)) return null
	return value
}

export function removeHighlightParam() {
	if (typeof window === 'undefined') return
	const url = new URL(window.location.href)
	url.searchParams.delete('highlight')
	window.history.replaceState({}, document.title, url.toString())
}
