import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HiOutlineCheckCircle,
  HiOutlineRefresh,
  HiOutlineTrash,
} from "react-icons/hi";
import { PageHeader } from "@/components/_reusable_components/page-header";
import { SearchInput } from "@/components/_reusable_components/search-input";
import { StatusFilter } from "@/components/_reusable_components/status-filter";

interface FollowupsTableHeaderProps {
  searchTerm: string;
  filterStatus: string;
  resetting: boolean;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onResetClick: () => void;
}

export function FollowupsTableHeader({
  searchTerm,
  filterStatus,
  resetting,
  isLoading,
  onSearchChange,
  onFilterChange,
  onResetClick,
}: FollowupsTableHeaderProps) {
  return (
    <CardHeader>
      <PageHeader
        icon={<HiOutlineCheckCircle className="text-primary h-6 w-6" />}
        title="Follow-ups"
        description="Track and manage all follow-up activities"
        actions={
          <>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search by soul, caller, or notes..."
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <StatusFilter value={filterStatus} onChange={onFilterChange} />
              <Button
                variant="destructive"
                className="h-10 px-3 sm:px-4 shrink-0 gap-2"
                onClick={onResetClick}
                disabled={resetting || isLoading}
                title="Reset All Follow-ups"
              >
                {resetting ? (
                  <HiOutlineRefresh className="h-4 w-4 animate-spin" />
                ) : (
                  <HiOutlineTrash className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </>
        }
      />
    </CardHeader>
  );
}
