import { CardHeader } from "@/components/ui/card";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { PageHeader } from "@/components/_reusable_components/page-header";
import { SearchInput } from "@/components/_reusable_components/search-input";
import { StatusFilter } from "@/components/_reusable_components/status-filter";

interface MyFollowupsTableHeaderProps {
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export function MyFollowupsTableHeader({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
}: MyFollowupsTableHeaderProps) {
  return (
    <CardHeader className="pb-7">
      <PageHeader
        icon={<HiOutlineCheckCircle className="text-primary h-6 w-6" />}
        title="My Follow-ups"
        description="Track your follow-up activities"
        actions={
          <>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search by soul or notes..."
            />
            <StatusFilter value={filterStatus} onChange={onFilterChange} />
          </>
        }
      />
    </CardHeader>
  );
}
