import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HiOutlineTrash, HiOutlineShieldCheck } from "react-icons/hi";
import type { Caller } from "@/lib/types";

interface UsersTableRowProps {
  user: Caller;
  soulCount: number;
  loadingCounts: boolean;
  onDelete: (id: string, name: string) => void;
}

export function UsersTableRow({
  user,
  soulCount,
  loadingCounts,
  onDelete,
}: UsersTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="py-4 w-[30%]">
        <div className="flex items-center gap-3">
          <Avatar>
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium text-foreground truncate block">
            {user.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-[12%]">
        <Badge
          variant={user.role === "admin" ? "default" : "secondary"}
          className="flex items-center gap-1 w-fit font-normal"
        >
          {user.role === "admin" && (
            <HiOutlineShieldCheck className="h-3 w-3 shrink-0" />
          )}
          <span className="truncate">{user.role}</span>
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground w-[30%]">
        <span className="truncate block">{user.email || "-"}</span>
      </TableCell>
      <TableCell className="text-center w-[15%]">
        {loadingCounts ? (
          <Skeleton className="h-5 w-12 mx-auto" />
        ) : user.role === "admin" ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <span className="font-medium">{soulCount}</span>
        )}
      </TableCell>
      <TableCell className="text-center w-[13%]">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(user.id, user.name)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <HiOutlineTrash className="h-5 w-5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
