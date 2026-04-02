"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BranchFormState,
  BranchWithRelations,
  buildFormFromBranch,
  emptyBranchForm,
} from "@/components/super-admin/branch-management";
import {
  createBranchRequest,
  deleteBranchRequest,
  fetchBranchesRequest,
  seedAlphaIntegrationsRequest,
  updateBranchRequest,
} from "@/components/super-admin/branch-management-api";

export function useBranchesManager() {
  const [branches, setBranches] = useState<BranchWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeedingAlpha, setIsSeedingAlpha] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchWithRelations | null>(null);
  const [form, setForm] = useState<BranchFormState>(emptyBranchForm);

  const activeBranches = useMemo(() => branches.filter((branch) => branch.status === "active").length, [branches]);
  const totalIntegrations = useMemo(() => branches.reduce((sum, branch) => sum + (branch.integrations?.length || 0), 0), [branches]);
  const totalSouls = useMemo(() => branches.reduce((sum, branch) => sum + (branch.souls_count || 0), 0), [branches]);
  const alphaBranch = useMemo(() => branches.find((branch) => branch.slug === "alpha") || null, [branches]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      setBranches(await fetchBranchesRequest());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreateDialog = () => {
    setForm(emptyBranchForm);
    setCreateOpen(true);
  };

  const openEditDialog = (branch: BranchWithRelations) => {
    setSelectedBranch(branch);
    setForm(buildFormFromBranch(branch));
    setEditOpen(true);
  };

  const openDeleteDialog = (branch: BranchWithRelations) => {
    setSelectedBranch(branch);
    setDeleteOpen(true);
  };

  const handleCreateBranch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createBranchRequest(form);
      toast.success("Branch created successfully");
      setCreateOpen(false);
      setForm(emptyBranchForm);
      await fetchBranches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBranch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBranch) return;
    setIsSubmitting(true);
    try {
      await updateBranchRequest(selectedBranch.id, form);
      toast.success("Branch updated successfully");
      setEditOpen(false);
      setSelectedBranch(null);
      setForm(emptyBranchForm);
      await fetchBranches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    setIsSubmitting(true);
    try {
      const payload = await deleteBranchRequest(selectedBranch.id);
      toast.success(payload.message || "Branch deleted successfully");
      setDeleteOpen(false);
      setSelectedBranch(null);
      await fetchBranches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const seedAlphaFromEnv = async () => {
    try {
      setIsSeedingAlpha(true);
      await seedAlphaIntegrationsRequest();
      toast.success("Alpha integrations were seeded from the current environment");
      await fetchBranches();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed Alpha integrations");
    } finally {
      setIsSeedingAlpha(false);
    }
  };

  return {
    branches,
    isLoading,
    isSeedingAlpha,
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
    alphaBranch,
    fetchBranches,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    handleCreateBranch,
    handleUpdateBranch,
    handleDeleteBranch,
    seedAlphaFromEnv,
  };
}
