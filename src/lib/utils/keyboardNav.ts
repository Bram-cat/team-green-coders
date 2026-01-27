/**
 * Handle keyboard navigation for clickable elements
 * Triggers action on Enter or Space key press
 */
export function handleKeyboardNav(
  e: React.KeyboardEvent,
  action: () => void
) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    action()
  }
}
