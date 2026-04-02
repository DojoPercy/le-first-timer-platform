import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HiOutlineSearch, HiOutlineUserGroup } from "react-icons/hi";
import { UserManagementDialog } from "@/components/admin/usersTable/UserManagementDialog";

interface UsersTableHeaderProps {
  searchTerm: string;
  roleFilter: string;
  isHydrated: boolean;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onUserCreated: () => void;
}

export function UsersTableHeader({
  searchTerm,
  roleFilter,
  isHydrated,
  onSearchChange,
  onRoleFilterChange,
  onUserCreated,
}: UsersTableHeaderProps) {
  return (
    <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <HiOutlineUserGroup className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
          Platform Users
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage admins and callers access
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
        <div className="relative w-full sm:w-64">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {isHydrated ? (
          <>
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="w-full sm:w-32 h-9">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="caller">Callers</SelectItem>
              </SelectContent>
            </Select>
            <UserManagementDialog onUserCreated={onUserCreated} />
          </>
        ) : (
          <>
            <div className="w-full sm:w-32 h-9" />
            <div className="w-full md:w-auto h-9" />
          </>
        )}
      </div>
    </CardHeader>
  );
}
