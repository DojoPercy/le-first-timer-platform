"use client";

import AvatarUploader from "@/components/profile/AvatarUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import React from "react";

type Props = {
  avatarUrl: string | null;
  uploading: boolean;
  onPickAvatar: (file: File) => void;
  onRemoveAvatar: () => void;
  user: any;
  pendingAvatar?: boolean;
};

export default function ProfileAside({ avatarUrl, uploading, onPickAvatar, onRemoveAvatar, user, pendingAvatar }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Profile</CardTitle>
          <Badge className="capitalize">{user?.role || "caller"}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <AvatarUploader avatarUrl={avatarUrl} uploading={uploading} onPickAvatar={onPickAvatar} user={user} />
          <h3 className="text-lg font-medium">{user?.name}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={onRemoveAvatar} disabled={uploading}>
              Remove Avatar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
