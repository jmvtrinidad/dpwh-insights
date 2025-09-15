import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContractorOption {
  value: string;
  label: string;
}

interface ContractorComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ContractorCombobox({
  value,
  onValueChange,
  placeholder = "Select contractor...",
  className
}: ContractorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contractors, setContractors] = useState<ContractorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 50;

  const fetchContractors = useCallback(async (search: string, offsetNum: number, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offsetNum.toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/contractors?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contractors');
      }

      const data = await response.json();
      const newContractors = data.contractors.map((contractor: string) => ({
        value: contractor,
        label: contractor,
      }));

      if (append) {
        setContractors(prev => [...prev, ...newContractors]);
      } else {
        setContractors(newContractors);
      }

      setTotal(data.total);
      setHasMore(offsetNum + newContractors.length < data.total);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchContractors("", 0, false);
  }, [fetchContractors]);

  // Handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setOffset(0);
      fetchContractors(searchTerm, 0, false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchContractors]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const newOffset = offset + limit;
      setOffset(newOffset);
      fetchContractors(searchTerm, newOffset, true);
    }
  };

  const selectedContractor = contractors.find((contractor) => contractor.value === value);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedContractor ? selectedContractor.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Loaded {contractors.length} contractors
          </div>
          <ScrollArea className="h-64">
            <div className="space-y-1">
              <div
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => {
                  onValueChange("__all__");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === "__all__" ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>All contractors</span>
              </div>
              {contractors.map((contractor) => (
                <div
                  key={contractor.value}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onValueChange(contractor.value === value ? "__all__" : contractor.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === contractor.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-sm">{contractor.label}</span>
                </div>
              ))}
              {hasMore && (
                <div
                  className="flex items-center justify-center p-2 text-muted-foreground cursor-pointer"
                  onClick={handleLoadMore}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load more..."
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
