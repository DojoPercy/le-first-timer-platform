import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Soul } from "@/lib/types";

interface SoulCardProps {
  soul: Soul;
  followupCount: number;
  onFollowupClick: (soul: Soul) => void;
}

export function SoulCard({ soul, followupCount, onFollowupClick }: SoulCardProps) {
  const completed = followupCount >= 4;

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-sm">{soul.full_name}</p>
        <p className="text-xs text-muted-foreground">{soul.phone}</p>
        <Progress value={followupCount ? (followupCount / 4) * 100 : 0} max={100} />
        <Badge variant={completed ? "default" : "secondary"}>
          {completed ? "Completed" : `${followupCount}/4 Follow-ups`}
        </Badge>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onFollowupClick(soul)}
        disabled={completed}
      >
        Follow-up
      </Button>
    </div>
  );
}
