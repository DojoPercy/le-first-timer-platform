interface TextTruncateProps {
  text: string | null | undefined;
  maxWords?: number;
  fallback?: string;
}

export function TextTruncate({
  text,
  maxWords = 2,
  fallback = "-",
}: TextTruncateProps) {
  if (!text) return <>{fallback}</>;

  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return <>{text}</>;

  return <>{words.slice(0, maxWords).join(" ") + "..."}</>;
}

export function truncateText(
  text: string | null | undefined,
  maxWords: number = 2,
  fallback: string = "-"
): string {
  if (!text) return fallback;

  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(" ") + "...";
}
