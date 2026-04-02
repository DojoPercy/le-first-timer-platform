"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type Props = {
  register: any;
  errors: any;
  isDirty: boolean;
  loading: boolean;
  avatarDirty?: boolean;
  onSubmit: (data: any) => void;
};

export default function ProfileInfoForm({
  register,
  errors,
  isDirty,
  loading,
  avatarDirty = false,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit as any} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          disabled
          className="bg-muted text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Please contact an administrator.
        </p>
      </div>

      <Button type="submit" disabled={loading || !(isDirty || avatarDirty)}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
