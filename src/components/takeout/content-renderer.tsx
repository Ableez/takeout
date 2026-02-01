"use client";

import { parseContent } from "#/lib/parse-content";

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const segments = parseContent(content);

  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "text":
            return <span key={index}>{segment.value}</span>;
          case "link":
            return (
              <a
                key={index}
                href={segment.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                {segment.value}
              </a>
            );
          case "hashtag":
            return (
              <span
                key={index}
                className="text-primary"
              >
                {segment.value}
              </span>
            );
          case "mention":
            return (
              <span
                key={index}
                className="text-primary font-medium"
              >
                {segment.value}
              </span>
            );
          default:
            return null;
        }
      })}
    </span>
  );
}
