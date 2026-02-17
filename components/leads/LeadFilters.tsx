'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function LeadFilters({ search, onSearchChange, status, onStatusChange }: LeadFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Search companies or contacts..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="unqualified">Unqualified</SelectItem>
          <SelectItem value="converted">Converted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
