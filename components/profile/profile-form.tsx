"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// icons not needed here
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ProfileAside from "@/components/profile/ProfileAside";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import SecurityForm from "@/components/profile/SecurityForm";
import { useCallerStore } from "@/lib/store/caller-store";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfileForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);

  const { updateProfile, uploadAvatar: storeUploadAvatar, removeAvatar: storeRemoveAvatar } = useCallerStore();
  const updatePassword = useCallerStore((s) => s.updatePassword);
  const { role: userRole } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/");
          return;
        }

        const { data: profile, error } = await supabase
          .from("callers")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (error) throw error;
        setUser(profile);
        setValue("name", profile.name);
        setValue("email", profile.email);
        setAvatarUrl(profile.avatar_url);
        setOriginalAvatarUrl(profile.avatar_url);
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Failed to load profile");
      }
    };
    fetchUser();
  }, [supabase, router, setValue]);

  const onPickAvatar = (file: File) => {
    if (pendingAvatarFile) {
      URL.revokeObjectURL(avatarUrl || "");
    }
    const preview = URL.createObjectURL(file);
    setPendingAvatarFile(file);
    setAvatarUrl(preview);
  };

  const onRemoveAvatar = async () => {
    try {
      // If there's a pending file, just clear it and restore original preview
      if (pendingAvatarFile) {
        URL.revokeObjectURL(avatarUrl || "");
        setPendingAvatarFile(null);
        setAvatarUrl(originalAvatarUrl);
        return;
      }
      if (!user?.avatar_url) return;
      setUploading(true);
      await storeRemoveAvatar(user.id);
      setAvatarUrl(null);
      setOriginalAvatarUrl(null);
      toast.success("Avatar removed");
      router.refresh();
    } catch (err) {
      toast.error("Failed to remove avatar");
    } finally {
      setUploading(false);
    }
  };

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      // If there's a pending avatar file, upload it first
      if (pendingAvatarFile) {
        setUploading(true);
        await storeUploadAvatar(user.id, user.user_id, pendingAvatarFile);
        setPendingAvatarFile(null);
        setOriginalAvatarUrl(null);
        setUploading(false);
      }
      await updateProfile(user.id, { name: data.name });
      toast.success("Profile updated successfully");
      router.refresh();
      reset(data);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormValues) => {
    try {
      setLoading(true);
      await updatePassword(data.password);
      toast.success("Password updated successfully");
      resetPassword();
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-4">
            <Card>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-36 w-36 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          </aside>
          <main className="md:col-span-8 space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-4">
          <ProfileAside
            avatarUrl={avatarUrl}
            uploading={uploading}
            onPickAvatar={onPickAvatar}
            onRemoveAvatar={onRemoveAvatar}
            user={user}
            pendingAvatar={!!pendingAvatarFile}
          />
        </aside>

        <main className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details and public information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileInfoForm
                register={register}
                errors={errors}
                isDirty={isDirty}
                loading={loading}
                avatarDirty={!!pendingAvatarFile}
                onSubmit={handleSubmit(onUpdateProfile)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityForm
                registerPassword={registerPassword}
                passwordErrors={passwordErrors}
                loading={loading}
                onSubmitPassword={onUpdatePassword}
                handleSubmitPassword={handleSubmitPassword}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
