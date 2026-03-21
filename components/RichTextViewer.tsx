"use client";

import DOMPurify from "isomorphic-dompurify";

interface RichTextViewerProps {
  html: string | null | undefined;
  className?: string;
}

export function RichTextViewer({ html, className = "" }: RichTextViewerProps) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "ul", "ol", "li",
      "h1", "h2", "h3", "blockquote", "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
