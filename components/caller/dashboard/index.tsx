"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoulCard } from "./SoulCard";
import { FollowupDialog } from "./FollowupDialog";
import { useDashboard } from "./useDashboard";

export default function CallerDashboard() {
  const {
    assignedSouls,
    showModal,
    setShowModal,
    followupNote,
    progress,
    handleFollowupClick,
    handleFollowupSubmit,
    handleNoteChange,
  } = useDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Assigned Souls</CardTitle>
      </CardHeader>
      <CardContent>
        {assignedSouls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No assigned souls</div>
        ) : (
          <div className="space-y-4">
            {assignedSouls.map((soul) => (
              <SoulCard
                key={soul.id}
                soul={soul}
                followupCount={progress[soul.id] || 0}
                onFollowupClick={handleFollowupClick}
              />
            ))}
          </div>
        )}
        <FollowupDialog
          open={showModal}
          onOpenChange={setShowModal}
          followupNote={followupNote}
          onNoteChange={handleNoteChange}
          onSubmit={handleFollowupSubmit}
        />
      </CardContent>
    </Card>
  );
}
