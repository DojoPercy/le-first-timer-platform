"use client";

import { BranchFormDialog } from "@/components/super-admin/BranchFormDialog";
import { BranchesTable } from "@/components/super-admin/BranchesTable";
import { BranchesToolbar } from "@/components/super-admin/BranchesToolbar";
import { DeleteBranchDialog } from "@/components/super-admin/DeleteBranchDialog";
import { emptyBranchForm } from "@/components/super-admin/branch-management";
import { useBranchesManager } from "@/components/super-admin/useBranchesManager";

export function BranchesManager() {
  const {
    branches,
    isLoading,
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    isSubmitting,
    selectedBranch,
    setSelectedBranch,
    form,
    setForm,
    activeBranches,
    totalIntegrations,
    totalSouls,
    fetchBranches,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleCreateBranch,
    handleUpdateBranch,
    handleDeleteBranch,
  } = useBranchesManager();

  return (
    <div className="space-y-6 sm:space-y-8">
      <BranchesToolbar
        branchCount={branches.length}
        activeBranches={activeBranches}
        totalSouls={totalSouls}
        totalIntegrations={totalIntegrations}
        onCreate={openCreateDialog}
        onRefresh={fetchBranches}
      />

      <BranchesTable
        branches={branches}
        isLoading={isLoading}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <BranchFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        form={form}
        onFormChange={(updater) => setForm(updater)}
        onSubmit={handleCreateBranch}
        isSubmitting={isSubmitting}
      />

      <BranchFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setSelectedBranch(null);
            setForm(emptyBranchForm);
          }
        }}
        form={form}
        onFormChange={(updater) => setForm(updater)}
        onSubmit={handleUpdateBranch}
        isSubmitting={isSubmitting}
      />

      <DeleteBranchDialog
        open={deleteOpen}
        branch={selectedBranch}
        isSubmitting={isSubmitting}
        onDelete={handleDeleteBranch}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) {
            setSelectedBranch(null);
          }
        }}
      />
    </div>
  );
}
