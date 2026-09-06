import React from 'react'

interface ChatMarkdownProps {
  content: string
  className?: string
}

/**
 * Parses and renders inline markdown elements:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * - `code` -> <code>
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null

  // Split by bold (** or __), inline code (`), and italic (* or _)
  const tokenRegex = /(\*\*[\s\S]*?\*\*|__[\s\S]*?__|`[^`]+`|\*[^*\n]+\*|_[^_\n]+_)/g
  const parts = text.split(tokenRegex)

  return parts.map((part, index) => {
    if (!part) return null

    // Bold: **text** or __text__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2)
      return (
        <strong key={index} className="font-bold text-on-surface font-headline">
          {renderInlineMarkdown(inner)}
        </strong>
      )
    }

    // Inline Code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-surface-container-highest text-primary font-mono text-xs font-semibold"
        >
          {inner}
        </code>
      )
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1)
      return (
        <em key={index} className="italic text-on-surface/90">
          {renderInlineMarkdown(inner)}
        </em>
      )
    }

    // Normal text
    return part
  })
}

/**
 * Lightweight, zero-dependency Markdown renderer for AI Assistant chat messages.
 * Formats:
 * - Unordered bullet lists (*, -, •, +)
 * - Ordered numbered lists (1., 2., etc.)
 * - Bold headings / key-values (**Heading:**)
 * - Paragraphs with clean typography matching the Material Design patient theme
 */
export function ChatMarkdown({ content, className = '' }: ChatMarkdownProps) {
  if (!content) return null

  // Normalize carriage returns
  const rawLines = content.replace(/\r\n/g, '\n').split('\n')
  const elements: React.ReactNode[] = []

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flushCurrentList = () => {
    if (!currentList) return

    if (currentList.type === 'ul') {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="my-2 pl-4 space-y-1.5 list-disc list-outside marker:text-primary marker:text-base text-on-surface"
        >
          {currentList.items.map((item, idx) => (
            <li key={idx} className="text-[14px] leading-relaxed pl-0.5">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      )
    } else {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="my-2 pl-4 space-y-1.5 list-decimal list-outside marker:text-primary marker:font-bold text-on-surface"
        >
          {currentList.items.map((item, idx) => (
            <li key={idx} className="text-[14px] leading-relaxed pl-0.5">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      )
    }

    currentList = null
  }

  rawLines.forEach((line, lineIdx) => {
    const trimmed = line.trim()

    // 1. Empty lines break lists and create paragraph spacing
    if (!trimmed) {
      flushCurrentList()
      return
    }

    // 2. Unordered Bullet match: "* item", "- item", "• item", "+ item"
    const ulMatch = line.match(/^(\s*)[*\-•+]\s+(.*)$/)
    if (ulMatch) {
      const itemText = ulMatch[2]
      if (currentList && currentList.type === 'ul') {
        currentList.items.push(itemText)
      } else {
        flushCurrentList()
        currentList = { type: 'ul', items: [itemText] }
      }
      return
    }

    // 3. Ordered List match: "1. item", "2. item", etc.
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/)
    if (olMatch) {
      const itemText = olMatch[2]
      if (currentList && currentList.type === 'ol') {
        currentList.items.push(itemText)
      } else {
        flushCurrentList()
        currentList = { type: 'ol', items: [itemText] }
      }
      return
    }

    // 4. Regular Paragraph / text line
    flushCurrentList()
    elements.push(
      <p
        key={`p-${lineIdx}`}
        className="my-1.5 first:mt-0 last:mb-0 text-[14px] leading-relaxed text-on-surface"
      >
        {renderInlineMarkdown(line)}
      </p>
    )
  })

  // Flush any lingering list items at end of message
  flushCurrentList()

  return <div className={`chat-markdown space-y-0.5 ${className}`}>{elements}</div>
}
