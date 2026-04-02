"use client";

import { FormEvent, useEffect, useState } from "react";

type BranchRecord = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  description?: string | null;
  status: "active" | "inactive";
  created_at: string;
  users_count?: number;
  first_timers_count?: number;
  branch_admin?: { name: string; email: string } | null;
  integrations?: Array<{
    sheet_id: string;
    sheet_range?: string | null;
    form_url?: string | null;
    status?: "active" | "paused" | "error";
  }>;
};

const emptyForm = {
  branchName: "",
  branchCode: "",
  description: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
  sheetId: "",
  sheetRange: "Form Responses 1!A:H",
  formUrl: "",
};

export default function SuperAdminBranchesPage() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "active" as "active" | "inactive",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    sheetId: "",
    sheetRange: "Form Responses 1!A:H",
    formUrl: "",
    integrationStatus: "active" as "active" | "paused" | "error",
  });
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/superadmin/branches", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load branches");
      }
      setBranches(payload?.branches || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, []);

  useEffect(() => {
    const selected = branches.find((branch) => branch.id === selectedBranchId);
    if (!selected) return;
    setEditForm({
      name: selected.name,
      code: selected.code || "",
      description: selected.description || "",
      status: selected.status,
      adminName: selected.branch_admin?.name || "",
      adminEmail: selected.branch_admin?.email || "",
      adminPassword: "",
      sheetId: selected.integrations?.[0]?.sheet_id || "",
      sheetRange: selected.integrations?.[0]?.sheet_range || "Form Responses 1!A:H",
      formUrl: selected.integrations?.[0]?.form_url || "",
      integrationStatus: selected.integrations?.[0]?.status || "active",
    });
  }, [branches, selectedBranchId]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/superadmin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch: {
            name: form.branchName,
            code: form.branchCode || null,
            description: form.description || null,
          },
          admin: {
            name: form.adminName,
            email: form.adminEmail,
            password: form.adminPassword,
          },
          integration: {
            sheetId: form.sheetId || null,
            sheetRange: form.sheetRange || null,
            formUrl: form.formUrl || null,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to create branch");
      }
      setForm(emptyForm);
      await loadBranches();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (branch: BranchRecord) => {
    setError(null);
    try {
      const response = await fetch(`/api/superadmin/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: branch.name,
          code: branch.code,
          description: branch.description,
          status: branch.status === "active" ? "inactive" : "active",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update branch");
      }
      await loadBranches();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update branch");
    }
  };

  const handleEditSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBranchId) return;

    setSavingEdit(true);
    setError(null);
    try {
      const response = await fetch(`/api/superadmin/branches/${selectedBranchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update branch");
      }
      await loadBranches();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update branch");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (branchId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/superadmin/branches/${branchId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete branch");
      }
      await loadBranches();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete branch");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Branches
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Create branches, attach their first timer sheet, and manage their active status.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:grid-cols-3"
      >
        <input
          value={form.branchName}
          onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Branch name"
          required
        />
        <input
          value={form.branchCode}
          onChange={(event) => setForm((current) => ({ ...current, branchCode: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Branch code"
        />
        <input
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Description"
        />
        <input
          value={form.adminName}
          onChange={(event) => setForm((current) => ({ ...current, adminName: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Branch admin name"
          required
        />
        <input
          value={form.adminEmail}
          onChange={(event) => setForm((current) => ({ ...current, adminEmail: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Branch admin email"
          type="email"
          required
        />
        <input
          value={form.adminPassword}
          onChange={(event) => setForm((current) => ({ ...current, adminPassword: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Temporary password"
          type="password"
          required
        />
        <input
          value={form.sheetId}
          onChange={(event) => setForm((current) => ({ ...current, sheetId: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none lg:col-span-2"
          placeholder="Google Sheet ID for first timer intake"
        />
        <input
          value={form.sheetRange}
          onChange={(event) => setForm((current) => ({ ...current, sheetRange: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          placeholder="Sheet range"
        />
        <input
          value={form.formUrl}
          onChange={(event) => setForm((current) => ({ ...current, formUrl: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none lg:col-span-2"
          placeholder="Google Form URL (optional)"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create branch"}
        </button>
        {error ? (
          <div className="lg:col-span-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Branch</th>
                <th className="px-4 py-4 font-medium">Admin</th>
                <th className="px-4 py-4 font-medium">Users</th>
                <th className="px-4 py-4 font-medium">First Timers</th>
                <th className="px-4 py-4 font-medium">Sheet</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(branches || []).map((branch) => (
                <tr key={branch.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">{branch.name}</div>
                    <div className="text-xs text-slate-500">
                      {branch.slug}{branch.code ? ` • ${branch.code}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {branch.branch_admin ? (
                      <>
                        <div>{branch.branch_admin.name}</div>
                        <div className="text-xs text-slate-500">{branch.branch_admin.email}</div>
                      </>
                    ) : (
                      "No admin"
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{branch.users_count || 0}</td>
                  <td className="px-4 py-4 text-slate-600">{branch.first_timers_count || 0}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {branch.integrations?.[0]?.sheet_id ? "Connected" : "Not connected"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBranchId(branch.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleStatusToggle(branch)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {branch.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(branch.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No branches found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBranchId ? (
        <form
          onSubmit={handleEditSave}
          className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:grid-cols-4"
        >
          <input
            value={editForm.name}
            onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Branch name"
            required
          />
          <input
            value={editForm.code}
            onChange={(event) => setEditForm((current) => ({ ...current, code: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Branch code"
          />
          <input
            value={editForm.description}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, description: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none lg:col-span-2"
            placeholder="Branch description"
          />
          <input
            value={editForm.adminName}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, adminName: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Branch admin name"
          />
          <input
            value={editForm.adminEmail}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, adminEmail: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Branch admin email"
            type="email"
          />
          <input
            value={editForm.adminPassword}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, adminPassword: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="New admin password (optional)"
            type="password"
          />
          <input
            value={editForm.sheetId}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, sheetId: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none lg:col-span-2"
            placeholder="Google Sheet ID"
          />
          <input
            value={editForm.sheetRange}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, sheetRange: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Sheet range"
          />
          <input
            value={editForm.formUrl}
            onChange={(event) =>
              setEditForm((current) => ({ ...current, formUrl: event.target.value }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none lg:col-span-2"
            placeholder="Google Form URL"
          />
          <select
            value={editForm.status}
            onChange={(event) =>
              setEditForm((current) => ({
                ...current,
                status: event.target.value as "active" | "inactive",
              }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={editForm.integrationStatus}
            onChange={(event) =>
              setEditForm((current) => ({
                ...current,
                integrationStatus: event.target.value as "active" | "paused" | "error",
              }))
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="active">Integration active</option>
            <option value="paused">Integration paused</option>
            <option value="error">Integration error</option>
          </select>
          <button
            type="submit"
            disabled={savingEdit}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingEdit ? "Saving..." : "Save branch changes"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedBranchId("")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
        </form>
      ) : null}
    </div>
  );
}
