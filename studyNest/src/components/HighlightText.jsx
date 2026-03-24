/**
 * HighlightText Component
 * Highlights matching search terms in text
 * 
 * @param {string} text - The text to display
 * @param {string} searchTerm - The search term to highlight
 * @returns {JSX.Element}
 */
export function HighlightText({ text, searchTerm }) {
  if (!searchTerm || !text) {
    return <span>{text}</span>
  }

  try {
    // Create regex pattern for case-insensitive search
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    
    // Split text by matches
    const parts = text.split(regex)
    
    return (
      <span>
        {parts.map((part, index) => {
          // Check if this part matches the search term (case-insensitive)
          if (part && part.toLowerCase() === searchTerm.toLowerCase()) {
            return (
              <mark key={index} className="bg-yellow-200 rounded px-1 font-semibold">
                {part}
              </mark>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </span>
    )
  } catch (error) {
    // Fallback if regex fails
    return <span>{text}</span>
  }
}
