"use client";

import { HiOutlineSearch } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CallerFollowupsFiltersProps {
  searchTerm: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function CallerFollowupsFilters({
  searchTerm,
  filterStatus,
  onSearchChange,
  onStatusChange,
}: CallerFollowupsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <HiOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by soul or notes..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-45">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Won">Won</SelectItem>
          <SelectItem value="Not Reachable">Not Reachable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
