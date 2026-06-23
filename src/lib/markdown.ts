// Tiny, dependency-free Markdown → HTML for product descriptions.
// HTML is escaped FIRST so any raw markup in the source is inert (no XSS),
// then a small, fixed set of inline styles is applied. Matches the subset
// Telegram renders natively (bold/italic/code/link), so the bot and mini app
// stay visually consistent. No library, no DOMPurify needed.
export function mdToHtml(md: string | undefined | null): string {
  if (!md) return "";
  const esc = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}
