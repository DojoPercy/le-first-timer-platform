import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StatusFilter({
  value,
  onChange,
  className = "w-full sm:w-40",
}: StatusFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} h-9 sm:h-10 text-sm`}>
        <SelectValue placeholder="All Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="Contacted">Contacted</SelectItem>
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="Not Reachable">Not Reachable</SelectItem>
      </SelectContent>
    </Select>
  );
}
