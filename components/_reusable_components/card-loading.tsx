import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardLoadingProps {
  headerHeight?: string;
  headerWidth?: string;
  contentHeight?: string;
  className?: string;
}

export function CardLoading({
  headerHeight = "h-5",
  headerWidth = "w-40",
  contentHeight = "h-64",
  className,
}: CardLoadingProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className={`${headerHeight} ${headerWidth}`} />
      </CardHeader>
      <CardContent>
        <Skeleton className={`${contentHeight} w-full`} />
      </CardContent>
    </Card>
  );
}

export function StatCardLoading({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
