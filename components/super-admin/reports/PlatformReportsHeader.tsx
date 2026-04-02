"use client";

import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlatformReportsHeaderProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

export function PlatformReportsHeader({ isGenerating, onGenerate }: PlatformReportsHeaderProps) {
  return (
    <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
      <div>
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          Complete general reporting across all branches with branch summaries and follow-up activity.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="h-8 bg-indigo-600 px-3 text-[11px] text-white shadow-sm hover:bg-indigo-700 sm:h-9 sm:px-4 sm:text-xs"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Generate Current Report</span>
              <span className="sm:hidden">Generate</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
