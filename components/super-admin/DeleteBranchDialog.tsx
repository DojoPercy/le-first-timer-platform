"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { BranchWithRelations } from "@/components/super-admin/branch-management";

interface DeleteBranchDialogProps {
  open: boolean;
  branch: BranchWithRelations | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteBranchDialog({ open, branch, isSubmitting, onOpenChange, onDelete }: DeleteBranchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete branch</DialogTitle>
          <DialogDescription>
            This removes the branch setup. Branches with ministry data cannot be deleted and should be marked inactive instead.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-foreground">
          {branch ? (
            <>
              <p className="font-medium">{branch.name}</p>
              <p className="mt-1 text-muted-foreground">
                Any existing souls, follow-ups, reports, or MC evangelism records will block deletion.
              </p>
            </>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isSubmitting} onClick={onDelete}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
            Delete Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
