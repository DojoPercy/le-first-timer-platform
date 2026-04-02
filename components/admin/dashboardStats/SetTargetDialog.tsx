"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetInput: string;
  onTargetInputChange: (value: string) => void;
  currentTarget: number | null;
  onSetTarget: () => void;
}

export function SetTargetDialog({
  open,
  onOpenChange,
  targetInput,
  onTargetInputChange,
  currentTarget,
  onSetTarget,
}: SetTargetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Year's Target</DialogTitle>
          <DialogDescription>
            Set the target number of souls to win for {new Date().getFullYear()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target (souls)</Label>
            <Input
              id="target"
              type="number"
              placeholder="Enter target number"
              value={targetInput}
              onChange={(e) => onTargetInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSetTarget();
                }
              }}
            />
            {currentTarget && (
              <p className="text-xs text-muted-foreground">
                Current target: {currentTarget.toLocaleString()} souls
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSetTarget}>Set Target</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
