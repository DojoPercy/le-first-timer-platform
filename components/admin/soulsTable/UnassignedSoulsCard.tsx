"use client";

import { useEffect, useState } from "react";
import { getCurrentBranchId } from "@/lib/auth/client-branch";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HiOutlineUserAdd,
  HiOutlineExclamationCircle,
  HiOutlineEmojiHappy,
} from "react-icons/hi";
import type { Soul } from "@/lib/types";

export function UnassignedSoulsCard() {
  const supabase = createClient();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnassignedSouls = async () => {
      try {
        const branchId = await getCurrentBranchId();

        if (!branchId) {
          setSouls([]);
          return;
        }

        const { data, error } = await supabase
          .from("souls")
          .select("*")
          .eq("branch_id", branchId)
          .is("assigned_caller_id", null);

        if (error) throw error;
        setSouls(data || []);
      } catch (error) {
        console.error("Failed to fetch unassigned souls:", error);
        setSouls([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnassignedSouls();
  }, [supabase]);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <HiOutlineExclamationCircle className="text-orange-500 h-5 w-5" />
          Unassigned Souls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : souls.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-2">
            <HiOutlineEmojiHappy className="h-10 w-10 text-green-500 opacity-50" />
            <p className="text-muted-foreground font-medium">
              Awaiting assignment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {souls.slice(0, 5).map((soul) => (
              <div
                key={soul.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{soul.full_name}</p>
                  <p className="text-xs text-muted-foreground">{soul.phone}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-primary/5 hover:text-primary h-8 w-8 p-0"
                >
                  <HiOutlineUserAdd className="h-5 w-5" />
                </Button>
              </div>
            ))}

            {souls.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                + {souls.length - 5} more unassigned souls
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
