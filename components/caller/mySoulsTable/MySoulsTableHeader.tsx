import { CardHeader, CardTitle } from "@/components/ui/card";

interface MySoulsTableHeaderProps {
  soulsCount: number;
}

export function MySoulsTableHeader({ soulsCount }: MySoulsTableHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl font-bold">My Souls ({soulsCount})</CardTitle>
    </CardHeader>
  );
}
