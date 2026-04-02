"use client";

import { Loader2, Camera, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

type Props = {
  avatarUrl: string | null;
  uploading: boolean;
  onPickAvatar: (file: File) => void;
  user: any;
};

export default function AvatarUploader({
  avatarUrl,
  uploading,
  onPickAvatar,
  user,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    onPickAvatar(file);
    // reset the input so same file can be picked again if needed
    e.currentTarget.value = "";
  };

  return (
    <div className="relative">
      <Avatar className="h-36 w-36">
        <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={user.name} />
        <AvatarFallback className="text-xl">
          {user.name?.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <label
        htmlFor="avatar-upload"
        className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer border-2 border-white flex items-center justify-center shadow-lg"
        style={{ transform: "translate(25%, 25%)" }}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={uploading}
      />
    </div>
  );
}
