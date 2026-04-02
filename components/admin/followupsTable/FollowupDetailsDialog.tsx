"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineUserCircle,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import type { Followup, Soul, Caller } from "@/lib/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/_reusable_components/status-badge";

interface FollowupDetailsDialogProps {
  followup: Followup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowupDetailsDialog({
  followup,
  open,
  onOpenChange,
}: FollowupDetailsDialogProps) {
  const [soul, setSoul] = useState<Soul | null>(null);
  const [caller, setCaller] = useState<Caller | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!followup) {
        setSoul(null);
        setCaller(null);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const [soulRes, callerRes] = await Promise.all([
          supabase
            .from("souls")
            .select("*")
            .eq("id", followup.soul_id)
            .maybeSingle(),
          supabase
            .from("callers")
            .select("*")
            .eq("id", followup.caller_id)
            .maybeSingle(),
        ]);

        if (soulRes.data) setSoul(soulRes.data);
        if (callerRes.data) setCaller(callerRes.data);
      } catch (error) {
        console.error("Failed to fetch follow-up details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [followup]);

  if (!followup) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  const InfoRow = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: string | undefined | null;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-sm text-foreground break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HiOutlineInformationCircle className="h-6 w-6 text-primary" />
            Follow-up Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading details...
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Soul Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Soul Information
              </h3>
              <div className="space-y-0 bg-muted/30 rounded-lg p-4">
                <InfoRow
                  label="Soul Name"
                  value={soul?.full_name}
                  icon={HiOutlineUser}
                />
                <InfoRow
                  label="Phone Number"
                  value={soul?.phone}
                  icon={HiOutlinePhone}
                />
              </div>
            </div>

            {/* Caller Information */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Caller Information
              </h3>
              <div className="space-y-0 bg-muted/30 rounded-lg p-4">
                <InfoRow
                  label="Caller Name"
                  value={caller?.name}
                  icon={HiOutlineUserCircle}
                />
                <InfoRow
                  label="Email"
                  value={caller?.email}
                  icon={HiOutlineMail}
                />
              </div>
            </div>

            {/* Follow-up Details */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Follow-up Details
              </h3>
              <div className="space-y-0 bg-muted/30 rounded-lg p-4">
                <InfoRow
                  label="Date"
                  value={formatDate(followup.date)}
                  icon={HiOutlineClock}
                />
                <div className="flex items-start gap-3 py-3 border-b">
                  <div className="flex-shrink-0 mt-0.5">
                    <HiOutlineCheckCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </p>
                    <StatusBadge status={followup.status} />
                  </div>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <HiOutlineDocumentText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                      {followup.notes || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Record Information
              </h3>
              <div className="space-y-0 bg-muted/30 rounded-lg p-4">
                <InfoRow
                  label="Created At"
                  value={formatDate(followup.created_at)}
                  icon={HiOutlineClock}
                />
                <InfoRow
                  label="Last Updated"
                  value={formatDate(followup.updated_at)}
                  icon={HiOutlineClock}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
