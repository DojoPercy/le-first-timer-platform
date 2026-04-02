import { ProfileEditor } from "@/components/profile-editor";

export default function AdminProfilePage() {
  return (
    <ProfileEditor
      roleLabel="Branch administrator"
      description="Update your branch administrator account details."
    />
  );
}
