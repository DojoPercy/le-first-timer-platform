import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BranchFormState } from "@/components/super-admin/branch-management";

interface BranchDetailsSectionProps {
  mode: "create" | "edit";
  form: BranchFormState;
  onFormChange: (updater: (current: BranchFormState) => BranchFormState) => void;
}

export function BranchDetailsSection({ mode, form, onFormChange }: BranchDetailsSectionProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Branch details</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-branch-name`}>Branch Name</Label>
          <Input
            id={`${mode}-branch-name`}
            value={form.branchName}
            placeholder="LE Evangelism Tema"
            onChange={(event) => onFormChange((current) => ({ ...current, branchName: event.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${mode}-branch-code`}>Branch Code</Label>
          <Input
            id={`${mode}-branch-code`}
            value={form.branchCode}
            placeholder="TEMA"
            onChange={(event) => onFormChange((current) => ({ ...current, branchCode: event.target.value }))}
          />
        </div>
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor={`${mode}-branch-description`}>Description</Label>
          <Textarea
            id={`${mode}-branch-description`}
            value={form.branchDescription}
            placeholder="Short internal description for the branch"
            onChange={(event) => onFormChange((current) => ({ ...current, branchDescription: event.target.value }))}
          />
        </div>
        {mode === "edit" ? (
          <div className="grid gap-2 md:max-w-[220px]">
            <Label>Branch Status</Label>
            <Select
              value={form.branchStatus}
              onValueChange={(value) =>
                onFormChange((current) => ({
                  ...current,
                  branchStatus: value as "active" | "inactive",
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
