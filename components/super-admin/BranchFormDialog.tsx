"use client";

import { FormEvent } from "react";
import { PencilLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { BranchFormState } from "@/components/super-admin/branch-management";
import { BranchAdminSection } from "@/components/super-admin/branch-form/BranchAdminSection";
import { BranchDetailsSection } from "@/components/super-admin/branch-form/BranchDetailsSection";
import { BranchIntegrationSection } from "@/components/super-admin/branch-form/BranchIntegrationSection";

interface BranchFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: BranchFormState;
  onFormChange: (updater: (current: BranchFormState) => BranchFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting: boolean;
}

export function BranchFormDialog({ mode, open, onOpenChange, form, onFormChange, onSubmit, isSubmitting }: BranchFormDialogProps) {
  const title = mode === "create" ? "Create branch" : "Edit branch";
  const description =
    mode === "create"
      ? "Add the branch, its branch admin, and the saved sheet connections."
      : "Update branch details, branch admin information, and saved sheet connections.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-5">
            <BranchDetailsSection mode={mode} form={form} onFormChange={onFormChange} />
            <BranchAdminSection mode={mode} form={form} onFormChange={onFormChange} />
            <div className="grid gap-4 lg:grid-cols-2">
              <BranchIntegrationSection mode={mode} type="souls" title="Souls intake integration" form={form} onFormChange={onFormChange} />
              <BranchIntegrationSection
                mode={mode}
                type="mc"
                title="MC evangelism integration"
                form={form}
                optional
                note="Leave this blank if the branch is not ready for MC evangelism sync yet."
                onFormChange={onFormChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4" /> : mode === "create" ? <Plus className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
              {mode === "create" ? "Create Branch" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
