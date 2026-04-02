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
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineAcademicCap,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineBookOpen,
  HiOutlineUserCircle,
  HiOutlineClock,
} from "react-icons/hi";
import type { Soul, Caller } from "@/lib/types";
import { useEffect, useState } from "react";

interface SoulDetailsDialogProps {
  soul: Soul | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callers: Caller[];
}

export function SoulDetailsDialog({
  soul,
  open,
  onOpenChange,
  callers,
}: SoulDetailsDialogProps) {
  const [assignedCaller, setAssignedCaller] = useState<Caller | null>(null);

  useEffect(() => {
    if (soul?.assigned_caller_id) {
      const caller = callers.find((c) => c.id === soul.assigned_caller_id);
      setAssignedCaller(caller || null);
    } else {
      setAssignedCaller(null);
    }
  }, [soul, callers]);

  if (!soul) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
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
            Soul Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Personal Information
            </h3>
            <div className="space-y-0 bg-muted/30 rounded-lg p-4">
              <InfoRow
                label="Full Name"
                value={soul.full_name}
                icon={HiOutlineUser}
              />
              <InfoRow
                label="Email Address"
                value={soul.email}
                icon={HiOutlineMail}
              />
              <InfoRow
                label="Phone Number (Primary)"
                value={soul.phone}
                icon={HiOutlinePhone}
              />
              <InfoRow
                label="WhatsApp Number"
                value={soul.whatsapp}
                icon={HiOutlinePhone}
              />
            </div>
          </div>

          {/* Education & Occupation */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Education & Occupation
            </h3>
            <div className="space-y-0 bg-muted/30 rounded-lg p-4">
              <InfoRow
                label="Occupation / Status"
                value={soul.occupation}
                icon={HiOutlineBriefcase}
              />
              <InfoRow
                label="School / Institution"
                value={soul.school}
                icon={HiOutlineAcademicCap}
              />
              <InfoRow
                label="Level / Year"
                value={soul.level}
                icon={HiOutlineBookOpen}
              />
            </div>
          </div>

          {/* Location & Assignment */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Location & Assignment
            </h3>
            <div className="space-y-0 bg-muted/30 rounded-lg p-4">
              <InfoRow
                label="Location"
                value={soul.location}
                icon={HiOutlineLocationMarker}
              />
              <InfoRow
                label="Assigned To"
                value={assignedCaller?.name || "Unassigned"}
                icon={HiOutlineUserCircle}
              />
              <InfoRow
                label="Last Follow-up"
                value={formatDate(soul.last_followup_at)}
                icon={HiOutlineClock}
              />
            </div>
          </div>

          {/* Spiritual Information */}
          {(soul.shepherd || soul.mc || soul.prayer) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Spiritual Information
              </h3>
              <div className="space-y-0 bg-muted/30 rounded-lg p-4">
                {soul.shepherd && (
                  <InfoRow
                    label="Shepherd / Soul Winner"
                    value={soul.shepherd}
                    icon={HiOutlineUserCircle}
                  />
                )}
                {soul.mc && (
                  <InfoRow
                    label="MC of Shepherd"
                    value={soul.mc}
                    icon={HiOutlineUserCircle}
                  />
                )}
                {soul.prayer && (
                  <InfoRow
                    label="Prayer Request"
                    value={soul.prayer}
                    icon={HiOutlineInformationCircle}
                  />
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Record Information
            </h3>
            <div className="space-y-0 bg-muted/30 rounded-lg p-4">
              <InfoRow
                label="Created At"
                value={formatDate(soul.created_at)}
                icon={HiOutlineClock}
              />
              <InfoRow
                label="Last Updated"
                value={formatDate(soul.updated_at)}
                icon={HiOutlineClock}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
