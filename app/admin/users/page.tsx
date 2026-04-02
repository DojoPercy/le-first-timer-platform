"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCallerStore } from "@/lib/store/caller-store";

export default function AdminUsersPage() {
  const { callers, fetchCallers, isLoading, deleteUser } = useCallerStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "caller">("caller");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCallers();
  }, [fetchCallers]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to create user");
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("caller");
      await fetchCallers();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete user"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Users
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Current branch users available for assignment and follow-up work.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 lg:grid-cols-4"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Full name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Team member name"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="name@church.org"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            placeholder="Temporary password"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Role
          </label>
          <div className="flex gap-3">
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as "admin" | "caller")}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="caller">Caller</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
        {error ? (
          <div className="lg:col-span-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Created</th>
                <th className="px-4 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {callers.map((caller) => (
                <tr key={caller.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {caller.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{caller.email}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {caller.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(caller.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void handleDelete(caller.id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && callers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No users found for this branch.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
