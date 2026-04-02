import { ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FollowupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followupNote: string;
  onNoteChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export function FollowupDialog({
  open,
  onOpenChange,
  followupNote,
  onNoteChange,
  onSubmit,
}: FollowupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter follow-up note..."
            value={followupNote}
            onChange={onNoteChange}
          />
          <Button onClick={onSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
