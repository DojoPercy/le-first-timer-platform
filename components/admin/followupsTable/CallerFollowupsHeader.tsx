"use client";

import { HiArrowLeft } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import type { Caller } from "@/lib/types";

interface CallerFollowupsHeaderProps {
  caller: Caller;
  soulsCount: number;
  followupsCount: number;
  onBack: () => void;
}

export function CallerFollowupsHeader({
  caller,
  soulsCount,
  followupsCount,
  onBack,
}: CallerFollowupsHeaderProps) {
  return (
    <CardHeader>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-lg font-bold sm:text-xl">
            {caller.name}&apos;s Follow-ups
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {soulsCount} assigned souls • {followupsCount} total follow-ups
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <HiArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </div>
    </CardHeader>
  );
}
