import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FilterOptions {
  regions: string[];
  implementingOffices: string[];
  contractors: string[];
  statuses: string[];
  years: string[];
  provinces: string[];
  municipalities: string[];
  barangays: string[];
}

interface FilterState {
  search: string;
  region: string;
  implementingOffice: string;
  contractor: string;
  status: string;
  year: string;
  province: string;
  municipality: string;
  barangay: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  options: FilterOptions;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function FilterSidebar({
  filters,
  options,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
  isCollapsed = false,
  onToggle
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    location: true,
    project: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFilters = () => {
    const activeFilters: Array<{ key: keyof FilterState; value: string; label: string }> = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'search' && value && value !== '__all__') {
        activeFilters.push({
          key: key as keyof FilterState,
          value,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        });
      }
    });
    return activeFilters;
  };

  if (isCollapsed) {
    return (
      <div className="w-16 border-r bg-sidebar">
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            data-testid="button-expand-filters"
            className="w-full"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-sidebar h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Filters</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            data-testid="button-collapse-filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              data-testid="button-clear-filters"
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* Search */}
          <Card className="p-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by project name, contractor, or office..."
                  value={filters.search}
                  onChange={(e) => onFilterChange('search', e.target.value)}
                  className="pl-10"
                  data-testid="input-search-projects"
                />
              </div>
            </div>
          </Card>
          {/* Location Filters */}
          <Card className="p-4">
            <Collapsible
              open={openSections.location}
              onOpenChange={() => toggleSection('location')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <h3 className="font-medium text-sidebar-foreground">Location</h3>
                {openSections.location ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Region</label>
                  <Select value={filters.region} onValueChange={(value) => onFilterChange('region', value)}>
                    <SelectTrigger data-testid="select-region">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All regions</SelectItem>
                      {options.regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Implementing Office</label>
                  <Select value={filters.implementingOffice} onValueChange={(value) => onFilterChange('implementingOffice', value)}>
                    <SelectTrigger data-testid="select-implementing-office">
                      <SelectValue placeholder="All offices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All offices</SelectItem>
                      {options.implementingOffices.map(office => (
                        <SelectItem key={office} value={office}>{office}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Province</label>
                  <Select value={filters.province} onValueChange={(value) => onFilterChange('province', value)}>
                    <SelectTrigger data-testid="select-province">
                      <SelectValue placeholder="All provinces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All provinces</SelectItem>
                      {options.provinces.map(province => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Municipality</label>
                  <Select value={filters.municipality} onValueChange={(value) => onFilterChange('municipality', value)}>
                    <SelectTrigger data-testid="select-municipality">
                      <SelectValue placeholder="All municipalities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All municipalities</SelectItem>
                      {options.municipalities.map(municipality => (
                        <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Barangay</label>
                  <Select value={filters.barangay} onValueChange={(value) => onFilterChange('barangay', value)}>
                    <SelectTrigger data-testid="select-barangay">
                      <SelectValue placeholder="All barangays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All barangays</SelectItem>
                      {options.barangays.map(barangay => (
                        <SelectItem key={barangay} value={barangay}>{barangay}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Project Filters */}
          <Card className="p-4">
            <Collapsible
              open={openSections.project}
              onOpenChange={() => toggleSection('project')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                <h3 className="font-medium text-sidebar-foreground">Project Details</h3>
                {openSections.project ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All statuses</SelectItem>
                      {options.statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Year</label>
                  <Select value={filters.year} onValueChange={(value) => onFilterChange('year', value)}>
                    <SelectTrigger data-testid="select-year">
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All years</SelectItem>
                      {options.years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Contractor</label>
                  <Select value={filters.contractor} onValueChange={(value) => onFilterChange('contractor', value)}>
                    <SelectTrigger data-testid="select-contractor">
                      <SelectValue placeholder="All contractors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All contractors</SelectItem>
                      {options.contractors.map(contractor => (
                        <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>

        </div>
      </div>

      {/* Active Filters */}
      {getActiveFilters().length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <h4 className="text-sm font-medium mb-2 text-sidebar-foreground">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map(({ key, value, label }) => (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs"
              >
                {label}: {value}
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-3 w-3"
                  onClick={() => onFilterChange(key, '')}
                  data-testid={`button-remove-filter-${key}`}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}