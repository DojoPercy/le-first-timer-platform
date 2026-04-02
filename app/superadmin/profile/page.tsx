import { ProfileEditor } from "@/components/profile-editor";

export default function SuperAdminProfilePage() {
  return (
    <ProfileEditor
      roleLabel="Superadmin account"
      description="Update your platform-level account details."
    />
  );
}
