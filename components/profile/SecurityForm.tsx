"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Props = {
  registerPassword: any;
  passwordErrors: any;
  loading: boolean;
  onSubmitPassword: (data: any) => void;
  handleSubmitPassword: any;
};

export default function SecurityForm({
  registerPassword,
  passwordErrors,
  loading,
  onSubmitPassword,
  handleSubmitPassword,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} {...registerPassword("password")} />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordErrors.password && (
          <p className="text-sm text-destructive">{passwordErrors.password.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input id="confirmPassword" type={showConfirm ? "text" : "password"} {...registerPassword("confirmPassword")} />
          <button
            type="button"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordErrors.confirmPassword && (
          <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Password
      </Button>
    </form>
  );
}
