export type ContentSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }
  | { type: "hashtag"; value: string; tag: string }
  | { type: "mention"; value: string; id: string }
  | { type: "todo"; value: string; checked: boolean; text: string };

const HASHTAG_REGEX = /#(\w+)/g;
const MENTION_REGEX = /@([\w-]+)/g;
const TODO_REGEX = /\[([x ])\]\s+(.+?)(?=\n|$)/gi;

export function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Combined regex to match all special patterns including todos
  const combinedRegex = /(https?:\/\/[^\s]+)|#(\w+)|@([\w-]+)|\[([x ])\]\s+([^\n]+)/gi;
  let match;

  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }

    const [fullMatch, url, hashtag, mention, todoCheck, todoText] = match;

    if (url) {
      segments.push({
        type: "link",
        value: url,
        href: url,
      });
    } else if (hashtag) {
      segments.push({
        type: "hashtag",
        value: `#${hashtag}`,
        tag: hashtag,
      });
    } else if (mention) {
      segments.push({
        type: "mention",
        value: `@${mention}`,
        id: mention,
      });
    } else if (todoCheck !== undefined && todoText) {
      segments.push({
        type: "todo",
        value: fullMatch,
        checked: todoCheck.toLowerCase() === "x",
        text: todoText.trim(),
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }

  return segments;
}

export function extractTags(content: string): string[] {
  const tags: string[] = [];
  let match;

  while ((match = HASHTAG_REGEX.exec(content)) !== null) {
    const tag = match[1];
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  // Reset regex lastIndex
  HASHTAG_REGEX.lastIndex = 0;

  return tags;
}

export function extractMentionIds(content: string): string[] {
  const mentions: string[] = [];
  let match;

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    const id = match[1];
    if (id && !mentions.includes(id)) {
      mentions.push(id);
    }
  }

  // Reset regex lastIndex
  MENTION_REGEX.lastIndex = 0;

  return mentions;
}

export function extractTodos(content: string): { total: number; completed: number } {
  const matches = content.matchAll(TODO_REGEX);
  let total = 0;
  let completed = 0;

  for (const match of matches) {
    total++;
    if (match[1].toLowerCase() === "x") {
      completed++;
    }
  }

  // Reset regex
  TODO_REGEX.lastIndex = 0;

  return { total, completed };
}
