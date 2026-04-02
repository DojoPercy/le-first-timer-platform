"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCallerStore } from "@/lib/store/caller-store";

interface ProfileEditorProps {
  roleLabel: string;
  description: string;
}

export function ProfileEditor({ roleLabel, description }: ProfileEditorProps) {
  const supabase = createClient();
  const {
    currentCaller,
    fetchCurrentCaller,
    updateProfile,
    updatePassword,
  } = useCallerStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;
      await fetchCurrentCaller(user.id);
    };

    void initialize();
  }, [fetchCurrentCaller, supabase.auth]);

  useEffect(() => {
    if (!currentCaller) return;
    setName(currentCaller.name || "");
    setEmail(currentCaller.email || "");
  }, [currentCaller]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentCaller?.id) return;

    setSavingProfile(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfile(currentCaller.id, { name, email });
      setMessage("Profile updated successfully.");
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return;

    setSavingPassword(true);
    setMessage(null);
    setError(null);

    try {
      await updatePassword(password);
      setPassword("");
      setMessage("Password updated successfully.");
    } catch (passwordError) {
      setError(
        passwordError instanceof Error
          ? passwordError.message
          : "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h2>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleProfileSubmit}
          className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Account
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {roleLabel}
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              placeholder="Your full name"
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
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile || !currentCaller}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Security
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Update password
            </h3>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              placeholder="Enter a new password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
