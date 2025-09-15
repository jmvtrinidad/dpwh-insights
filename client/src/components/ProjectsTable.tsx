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
                  <TableHead className="w-32"><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-32 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableHead>
                  <TableHead className="text-right"><div className="h-4 bg-muted rounded w-20 animate-pulse ml-auto"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-28 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableHead>
                  <TableHead><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-full"></div></TableCell>
                    <TableCell><div className="h-6 bg-muted rounded w-16"></div></TableCell>
                    <TableCell className="text-right"><div className="h-4 bg-muted rounded w-20 ml-auto"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-28"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-16"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
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
        {/* Page Size Control */}
        <div className="flex justify-end">
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
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
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
                  <TableHead className="w-32">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('contractId')}
                      data-testid="sort-contractId"
                    >
                      Contract ID
                      {sortField === 'contractId' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'contractId' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('contractName')}
                      data-testid="sort-contractName"
                    >
                      Project Name
                      {sortField === 'contractName' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'contractName' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('status')}
                      data-testid="sort-status"
                    >
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'status' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('contractCost')}
                      data-testid="sort-contractCost"
                    >
                      Cost
                      {sortField === 'contractCost' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'contractCost' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('contractor')}
                      data-testid="sort-contractor"
                    >
                      Contractor
                      {sortField === 'contractor' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'contractor' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>Implementing Office</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 hover:bg-transparent" 
                      onClick={() => handleSort('year')}
                      data-testid="sort-year"
                    >
                      Year
                      {sortField === 'year' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-1 h-3 w-3" /> : 
                          <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                      {sortField !== 'year' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProjects.map((project) => (
                  <TableRow key={project.contractId} className="hover-elevate" data-testid={`row-project-${project.contractId}`}>
                    <TableCell className="font-mono text-sm">
                      {project.contractId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium" title={project.contractName}>
                        {project.contractName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(project.status, project.accomplishmentInPercentage)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-primary">
                      {formatCurrency(project.contractCost)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate" title={project.contractor}>
                        {project.contractor}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate" title={project.implementingOffice}>
                        {project.implementingOffice}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
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
                          Brgy. {project.barangay}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {project.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(project.contractEffectivityDate)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(project.contractExpiryDate)}
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