import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
          
          {/* Loading Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full"><div className="h-4 bg-muted rounded w-20 animate-pulse">Projects</div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="p-3 md:p-4">
                      <div className="bg-muted/30 rounded-lg p-3 md:p-4 space-y-3">
                        <div className="space-y-2">
                          <div className="h-5 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-2/3"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              variant={sortField === 'contractName' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('contractName')}
              data-testid="sort-contractName"
            >
              Project Name
              {sortField === 'contractName' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="ml-1 h-3 w-3" /> : 
                  <ArrowDown className="ml-1 h-3 w-3" />
              )}
              {sortField !== 'contractName' && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === 'contractCost' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('contractCost')}
              data-testid="sort-contractCost"
            >
              Cost
              {sortField === 'contractCost' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="ml-1 h-3 w-3" /> : 
                  <ArrowDown className="ml-1 h-3 w-3" />
              )}
              {sortField !== 'contractCost' && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('year')}
              data-testid="sort-year"
            >
              Year
              {sortField === 'year' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="ml-1 h-3 w-3" /> : 
                  <ArrowDown className="ml-1 h-3 w-3" />
              )}
              {sortField !== 'year' && <ArrowUpDown className="ml-1 h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === 'status' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('status')}
              data-testid="sort-status"
            >
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? 
                  <ArrowUp className="ml-1 h-3 w-3" /> : 
                  <ArrowDown className="ml-1 h-3 w-3" />
              )}
              {sortField !== 'status' && <ArrowUpDown className="ml-1 h-3 w-3" />}
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
              <SelectItem value="10">10 projects</SelectItem>
              <SelectItem value="25">25 projects</SelectItem>
              <SelectItem value="50">50 projects</SelectItem>
              <SelectItem value="100">100 projects</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Table */}
        {currentProjects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProjects.map((project) => (
                  <TableRow key={project.contractId} className="hover-elevate" data-testid={`row-project-${project.contractId}`}>
                    <TableCell className="p-3 md:p-4">
                      <div className="bg-muted/30 rounded-lg p-3 md:p-4 space-y-3">
                        {/* Project Title and Category */}
                        <div>
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 break-words" title={project.contractName}>
                            {project.contractName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">Infrastructure Development</p>
                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                          {/* Left Column */}
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Location:</span>
                              <div className="mt-1">
                                <div className="flex flex-wrap gap-1">
                                  {project.municipality && (
                                    <span className="line-clamp-1 break-words">{project.municipality.toUpperCase()}</span>
                                  )}
                                  {project.province && project.municipality && <span>, </span>}
                                  {project.province && (
                                    <span className="line-clamp-1 break-words">{project.province.toUpperCase()}</span>
                                  )}
                                </div>
                                <div className="text-muted-foreground line-clamp-1">
                                  {project.region}
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span>
                              <div className="mt-1">
                                <span className="font-bold text-base md:text-lg text-primary break-all">
                                  {formatCurrency(project.contractCost)}
                                </span>
                                <div className="text-muted-foreground mt-1">
                                  {getStatusBadge(project.status, project.accomplishmentInPercentage)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Fiscal Year:</span>
                              <div className="mt-1">
                                FY {project.year}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Contractor:</span>
                              <div className="mt-1 line-clamp-2 break-words" title={project.contractor}>
                                {project.contractor}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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