import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BranchFormState } from "@/components/super-admin/branch-management";

interface BranchAdminSectionProps {
  mode: "create" | "edit";
  form: BranchFormState;
  onFormChange: (updater: (current: BranchFormState) => BranchFormState) => void;
}

export function BranchAdminSection({ mode, form, onFormChange }: BranchAdminSectionProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Branch admin</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-admin-name`}>Admin Name</Label>
          <Input
            id={`${mode}-admin-name`}
            value={form.adminName}
            onChange={(event) => onFormChange((current) => ({ ...current, adminName: event.target.value }))}
            required={mode === "create"}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-admin-email`}>Admin Email</Label>
          <Input
            id={`${mode}-admin-email`}
            type="email"
            value={form.adminEmail}
            onChange={(event) => onFormChange((current) => ({ ...current, adminEmail: event.target.value }))}
            required={mode === "create"}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-admin-password`}>{mode === "create" ? "Temporary Password" : "Reset Password"}</Label>
          <Input
            id={`${mode}-admin-password`}
            type="password"
            value={form.adminPassword}
            placeholder={mode === "edit" ? "Leave blank to keep current password" : "Create a temporary password"}
            onChange={(event) => onFormChange((current) => ({ ...current, adminPassword: event.target.value }))}
            required={mode === "create"}
          />
        </div>
      </div>
    </div>
  );
}
