import { Button } from "@/components/ui/button";
import { ComponentType } from "react";

interface ActionIconButtonProps {
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  title?: string;
  variant?: "ghost" | "destructive" | "outline" | "default" | "secondary" | "link";
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export function ActionIconButton({
  icon: Icon,
  onClick,
  title,
  variant = "ghost",
  className = "h-8 w-8",
  iconClassName = "h-5 w-5",
  disabled,
}: ActionIconButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      className={className}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      <Icon className={iconClassName} />
    </Button>
  );
}
