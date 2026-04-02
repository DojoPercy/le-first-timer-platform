import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface NoDataCardProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  height?: string;
  className?: string;
}

export function NoDataCard({
  title,
  message = "No data available",
  icon,
  height = "h-64",
  className,
}: NoDataCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className={`flex items-center justify-center ${height} text-muted-foreground`}>
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
