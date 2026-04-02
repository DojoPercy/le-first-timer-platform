"use client";

import * as React from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  const getVisiblePages = () => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    if (current <= 3) {
      // Show first 3 pages, ellipsis, last page
      pages.push(1, 2, 3, "...", total);
    } else if (current >= total - 2) {
      // Show first page, ellipsis, last 3 pages
      pages.push(1, "...", total - 2, total - 1, total);
    } else {
      // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
      >
        <HiOutlineChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <Button
              key={pageNum}
              variant={pageNum === current ? "default" : "outline"}
              size="sm"
              className={`h-9 min-w-9 ${
                pageNum === current
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
              onClick={() => onChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
      >
        <HiOutlineChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
