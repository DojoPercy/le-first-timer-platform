import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HiOutlineSearch, HiOutlineHeart } from "react-icons/hi";

interface SoulsTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SoulsTableHeader({
  searchTerm,
  onSearchChange,
}: SoulsTableHeaderProps) {
  return (
    <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <HiOutlineHeart className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
          Evangelism Souls
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage and assign souls for follow-up
        </p>
      </div>
      <div className="relative w-full lg:max-w-sm">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
        />
      </div>
    </CardHeader>
  );
}
