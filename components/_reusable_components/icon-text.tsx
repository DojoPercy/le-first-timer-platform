import { ComponentType, ReactNode } from "react";

interface IconTextProps {
  icon: ComponentType<{ className?: string }> | ReactNode;
  text: string | undefined | null;
  iconClassName?: string;
  textClassName?: string;
  containerClassName?: string;
  fallback?: string;
}

export function IconText({
  icon: Icon,
  text,
  iconClassName = "h-4 w-4 text-muted-foreground shrink-0",
  textClassName = "truncate",
  containerClassName = "flex items-center gap-2 min-w-0",
  fallback = "Unknown",
}: IconTextProps) {
  return (
    <div className={containerClassName}>
      {typeof Icon === "function" ? (
        <Icon className={iconClassName} />
      ) : (
        Icon
      )}
      <span className={textClassName}>{text || fallback}</span>
    </div>
  );
}
