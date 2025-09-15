import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";

interface Project {
  contractId: string;
  contractName: string;
  contractor: string;
  implementingOffice: string;
  contractCost: number;
  contractEffectivityDate: string;
  contractExpiryDate: string;
  status: string;
  accomplishmentInPercentage: number;
  region: string;
  sourceOfFundsDesc: string;
  sourceOfFundsYear: string;
  sourceOfFundsSource: string;
  year: string;
  province: string;
  municipality: string;
  barangay: string;
}

interface ProjectsTableProps {
  projects: Project[];
  isLoading?: boolean;
}

type SortField = keyof Project;
type SortDirection = 'asc' | 'desc';

export default function ProjectsTable({ projects, isLoading = false }: ProjectsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('contractId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Sort projects (filtering is now handled by DashboardLayout)
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });

    return filtered;
  }, [projects, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  const getStatusBadge = (status: string, accomplishment: number) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'on-going':
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            On-going ({accomplishment}%)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
            </div>
            <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded w-20 animate-pulse"></div>
              ))}
            </div>
            <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          
          {/* Loading Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-5 bg-muted rounded w-full"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-5 bg-muted rounded w-12"></div>
                      <div className="h-5 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 bg-muted rounded w-24"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Projects Overview
          </CardTitle>
          <Badge variant="outline" data-testid="table-project-count">
            {filteredAndSortedProjects.length} of {projects.length} projects
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sorting Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
            <Button
              variant={sortField === 'contractId' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('contractId')}
              data-testid="sort-contractId"
            >
              Contract ID
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant={sortField === 'contractName' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('contractName')}
              data-testid="sort-contractName"
            >
              Project Name
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant={sortField === 'status' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('status')}
              data-testid="sort-status"
            >
              Status
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant={sortField === 'contractCost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('contractCost')}
              data-testid="sort-contractCost"
            >
              Cost
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            <Button
              variant={sortField === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('year')}
              data-testid="sort-year"
            >
              Year
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
          
          {/* Page Size Control */}
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-32" data-testid="select-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 cards</SelectItem>
              <SelectItem value="25">25 cards</SelectItem>
              <SelectItem value="50">50 cards</SelectItem>
              <SelectItem value="100">100 cards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Cards Grid */}
        {currentProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProjects.map((project) => (
              <Card key={project.contractId} className="hover-elevate" data-testid={`row-project-${project.contractId}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-mono text-muted-foreground">
                        {project.contractId}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mt-1" title={project.contractName}>
                        {project.contractName}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {project.year}
                      </Badge>
                      {getStatusBadge(project.status, project.accomplishmentInPercentage)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {/* Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contract Cost</span>
                    <span className="font-mono font-semibold text-lg text-primary">
                      {formatCurrency(project.contractCost)}
                    </span>
                  </div>

                  {/* Contractor */}
                  <div>
                    <span className="text-sm text-muted-foreground block">Contractor</span>
                    <span className="font-medium text-sm" title={project.contractor}>
                      {project.contractor}
                    </span>
                  </div>

                  {/* Location */}
                  <div>
                    <span className="text-sm text-muted-foreground block">Location</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.region}
                      </Badge>
                      {project.province && (
                        <Badge variant="outline" className="text-xs">
                          {project.province}
                        </Badge>
                      )}
                      {project.municipality && (
                        <Badge variant="outline" className="text-xs">
                          {project.municipality}
                        </Badge>
                      )}
                    </div>
                    {project.barangay && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Barangay: {project.barangay}
                      </div>
                    )}
                  </div>

                  {/* Implementing Office */}
                  <div>
                    <span className="text-sm text-muted-foreground block">Implementing Office</span>
                    <span className="text-sm" title={project.implementingOffice}>
                      {project.implementingOffice}
                    </span>
                  </div>

                  {/* Contract Dates */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Start Date</span>
                      <span className="font-medium">
                        {formatDate(project.contractEffectivityDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">End Date</span>
                      <span className="font-medium">
                        {formatDate(project.contractExpiryDate)}
                      </span>
                    </div>
                  </div>

                  {/* Source of Funds */}
                  {project.sourceOfFundsDesc && (
                    <div>
                      <span className="text-sm text-muted-foreground block">Source of Funds</span>
                      <div className="text-sm">
                        {project.sourceOfFundsDesc}
                        {project.sourceOfFundsYear && (
                          <span className="text-muted-foreground"> ({project.sourceOfFundsYear})</span>
                        )}
                        {project.sourceOfFundsSource && (
                          <span className="text-muted-foreground block text-xs">
                            {project.sourceOfFundsSource}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedProjects.length)} of{' '}
              {filteredAndSortedProjects.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                data-testid="button-first-page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Page</span>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 h-8 text-center"
                  data-testid="input-page-number"
                />
                <span className="text-sm">of {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                data-testid="button-last-page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}