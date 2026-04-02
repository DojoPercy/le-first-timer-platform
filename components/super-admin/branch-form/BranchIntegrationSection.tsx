import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BranchFormState } from "@/components/super-admin/branch-management";

interface BranchIntegrationSectionProps {
  mode: "create" | "edit";
  title: string;
  type: "souls" | "mc";
  form: BranchFormState;
  note?: string;
  optional?: boolean;
  onFormChange: (updater: (current: BranchFormState) => BranchFormState) => void;
}

export function BranchIntegrationSection({ mode, title, type, form, note, optional, onFormChange }: BranchIntegrationSectionProps) {
  const sheetId = type === "souls" ? form.soulsSheetId : form.mcSheetId;
  const sheetRange = type === "souls" ? form.soulsSheetRange : form.mcSheetRange;
  const formUrl = type === "souls" ? form.soulsFormUrl : form.mcFormUrl;
  const status = type === "souls" ? form.soulsStatus : form.mcStatus;
  const prefix = `${mode}-${type}`;

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-sheet-id`}>Sheet ID</Label>
          <Input
            id={`${prefix}-sheet-id`}
            value={sheetId}
            placeholder={optional ? "Optional" : undefined}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                ...(type === "souls" ? { soulsSheetId: event.target.value } : { mcSheetId: event.target.value }),
              }))
            }
            required={!optional}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-sheet-range`}>Sheet Range</Label>
          <Input
            id={`${prefix}-sheet-range`}
            placeholder={type === "souls" ? "Form Responses 1!A:M" : "Form Responses 1!A:H"}
            value={sheetRange}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                ...(type === "souls" ? { soulsSheetRange: event.target.value } : { mcSheetRange: event.target.value }),
              }))
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-form-url`}>Form URL</Label>
          <Input
            id={`${prefix}-form-url`}
            value={formUrl}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                ...(type === "souls" ? { soulsFormUrl: event.target.value } : { mcFormUrl: event.target.value }),
              }))
            }
          />
        </div>
        {mode === "edit" ? (
          <div className="grid gap-2 md:max-w-[220px]">
            <Label>Sync Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                onFormChange((current) => ({
                  ...current,
                  ...(type === "souls"
                    ? { soulsStatus: value as "active" | "paused" | "error" }
                    : { mcStatus: value as "active" | "paused" | "error" }),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}
