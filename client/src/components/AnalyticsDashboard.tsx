import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Building, Users, Calendar, MapPin, CheckCircle, Clock, AlertCircle, BarChart3, HardHat, ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  contractId: string;
  contractName: string;
  contractor: string[];
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

interface AnalyticsDashboardProps {
  projects: Project[];
  isLoading?: boolean;
  onFilterChange?: (key: 'region'|'implementingOffice'|'contractor'|'province'|'municipality'|'barangay'|'status'|'year', value: string) => void;
}

type ContractorSortType = 'mostProjects' | 'fewestProjects' | 'highestCost' | 'lowestCost';

interface ContractorData {
  name: string;
  projectCount: number;
  totalCost: number;
  completed: number;
  ongoing: number;
}

export default function AnalyticsDashboard({ projects, isLoading = false, onFilterChange }: AnalyticsDashboardProps) {
  const [contractorSortBy, setContractorSortBy] = useState<ContractorSortType>('mostProjects');
  const [contractorPage, setContractorPage] = useState(1);
  const contractorsPerPage = 10;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate key metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status.toLowerCase() === 'completed').length;
  const ongoingProjects = projects.filter(p => p.status.toLowerCase() === 'on-going').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.contractCost, 0);
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Process contractor data with project count and total cost
  const getContractorData = (): ContractorData[] => {
    const contractorMap = new Map<string, ContractorData>();
    
    projects.forEach(project => {
      project.contractor.forEach(contractorName => {
        if (!contractorMap.has(contractorName)) {
          contractorMap.set(contractorName, {
            name: contractorName,
            projectCount: 0,
            totalCost: 0,
            completed: 0,
            ongoing: 0
          });
        }
        
        const contractor = contractorMap.get(contractorName)!;
        contractor.projectCount++;
        contractor.totalCost += project.contractCost;
        
        if (project.status.toLowerCase() === 'completed') {
          contractor.completed++;
        } else if (project.status.toLowerCase() === 'on-going') {
          contractor.ongoing++;
        }
      });
    });
    
    return Array.from(contractorMap.values());
  };

  const contractorData = getContractorData();

  // Sort contractor data based on selected sort type
  const sortedContractorData = [...contractorData].sort((a, b) => {
    switch (contractorSortBy) {
      case 'mostProjects':
        return b.projectCount - a.projectCount;
      case 'fewestProjects':
        return a.projectCount - b.projectCount;
      case 'highestCost':
        return b.totalCost - a.totalCost;
      case 'lowestCost':
        return a.totalCost - b.totalCost;
      default:
        return b.projectCount - a.projectCount;
    }
  });

  // Paginate contractor data
  const totalContractorPages = Math.ceil(sortedContractorData.length / contractorsPerPage);
  const startContractorIndex = (contractorPage - 1) * contractorsPerPage;
  const endContractorIndex = startContractorIndex + contractorsPerPage;
  const currentContractorData = sortedContractorData.slice(startContractorIndex, endContractorIndex);

  // Prepare chart data based on sort type
  const getContractorChartData = () => {
    const topContractors = sortedContractorData.slice(0, 10); // Top 10 for chart
    
    return topContractors.map(contractor => ({
      name: contractor.name.length > 20 ? contractor.name.substring(0, 20) + '...' : contractor.name,
      fullName: contractor.name,
      value: contractorSortBy.includes('Cost') ? contractor.totalCost / 1000000 : contractor.projectCount,
      projectCount: contractor.projectCount,
      totalCost: contractor.totalCost
    }));
  };

  const contractorChartData = getContractorChartData();

  // Custom tooltip for contractor chart
  const ContractorTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-md max-w-xs">
          <p className="font-medium text-card-foreground text-sm">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">
            Projects: {data.projectCount}
          </p>
          <p className="text-sm text-muted-foreground">
            Total Cost: ₱{(data.totalCost / 1000000).toFixed(1)}M
          </p>
        </div>
      );
    }
    return null;
  };

  // Chart data preparation
  const getChartData = (groupBy: keyof Project, label: string) => {
    const grouped = projects.reduce((acc, project) => {
      // Handle contractor array specially by flattening
      if (groupBy === 'contractor') {
        project.contractor.forEach(contractor => {
          if (!acc[contractor]) {
            acc[contractor] = { name: contractor, count: 0, completed: 0, ongoing: 0 };
          }
          acc[contractor].count++;
          if (project.status.toLowerCase() === 'completed') acc[contractor].completed++;
          if (project.status.toLowerCase() === 'on-going') acc[contractor].ongoing++;
        });
      } else {
        const key = project[groupBy] as string;
        if (!acc[key]) {
          acc[key] = { name: key, count: 0, completed: 0, ongoing: 0 };
        }
        acc[key].count++;
        if (project.status.toLowerCase() === 'completed') acc[key].completed++;
        if (project.status.toLowerCase() === 'on-going') acc[key].ongoing++;
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; completed: number; ongoing: number }>);

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 for better visualization
  };

  const regionData = getChartData('region', 'Region');
  const statusData = getChartData('status', 'Status');
  const yearData = getChartData('year', 'Year');
  const officeData = getChartData('implementingOffice', 'Office');
  const provinceData = getChartData('province', 'Province');
  const municipalityData = getChartData('municipality', 'Municipality');
  const barangayData = getChartData('barangay', 'Barangay');

  const chartColors = {
    primary: '#0066CC',
    secondary: '#228B22',
    warning: '#FFC107',
    accent: '#6C757D'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-md">
          <p className="font-medium text-card-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Total: {payload[0].value} projects
          </p>
        </div>
      );
    }
    return null;
  };

  const getSortLabel = (sortType: ContractorSortType) => {
    switch (sortType) {
      case 'mostProjects': return 'Most Projects';
      case 'fewestProjects': return 'Fewest Projects';
      case 'highestCost': return 'Highest Cost';
      case 'lowestCost': return 'Lowest Cost';
      default: return 'Most Projects';
    }
  };

  const getChartYAxisLabel = () => {
    return contractorSortBy.includes('Cost') ? 'Cost (Millions ₱)' : 'Number of Projects';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-total-projects" className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{totalProjects.toLocaleString()}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                All time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-completed-projects" className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {completionRate}% completion rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-ongoing-projects" className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-going</p>
                <p className="text-2xl font-bold text-amber-600">{ongoingProjects.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {Math.round((ongoingProjects / totalProjects) * 100)}% of total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="metric-total-budget" className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">
                  ₱{(totalBudget / 1000000000).toFixed(1)}B
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Billion pesos
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Analytics Section */}
      <div className="space-y-6">
        <h2 data-testid="header-location-analytics" className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Location Analytics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Projects by Region */}
          <Card data-testid="chart-regions" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Projects by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} cursor="pointer">
                    {regionData.map((entry, index) => (
                      <Cell 
                        key={`region-cell-${index}`}
                        data-testid={`bar-region-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('region', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Implementing Office */}
          <Card data-testid="chart-offices" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Implementing Offices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={officeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.accent} radius={[4, 4, 0, 0]} cursor="pointer">
                    {officeData.map((entry, index) => (
                      <Cell 
                        key={`office-cell-${index}`}
                        data-testid={`bar-implementingOffice-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('implementingOffice', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Province */}
          <Card data-testid="chart-provinces" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Top Provinces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={provinceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.secondary} radius={[4, 4, 0, 0]} cursor="pointer">
                    {provinceData.map((entry, index) => (
                      <Cell 
                        key={`province-cell-${index}`}
                        data-testid={`bar-province-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('province', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Municipality */}
          <Card data-testid="chart-municipalities" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Top Municipalities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={municipalityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.warning} radius={[4, 4, 0, 0]} cursor="pointer">
                    {municipalityData.map((entry, index) => (
                      <Cell 
                        key={`municipality-cell-${index}`}
                        data-testid={`bar-municipality-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('municipality', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Barangay */}
          <Card data-testid="chart-barangays" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Top Barangays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barangayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} cursor="pointer">
                    {barangayData.map((entry, index) => (
                      <Cell 
                        key={`barangay-cell-${index}`}
                        data-testid={`bar-barangay-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('barangay', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Other Analytics */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          General Analytics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects by Status */}
          <Card data-testid="chart-status" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Projects by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.secondary} radius={[4, 4, 0, 0]} cursor="pointer">
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`status-cell-${index}`}
                        data-testid={`bar-status-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('status', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projects by Year */}
          <Card data-testid="chart-years" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Projects by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={chartColors.warning} radius={[4, 4, 0, 0]} cursor="pointer">
                    {yearData.map((entry, index) => (
                      <Cell 
                        key={`year-cell-${index}`}
                        data-testid={`bar-year-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => onFilterChange?.('year', entry.name)}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Contractor Analytics Section */}
      <div className="space-y-6">
        <h2 data-testid="header-contractor-analytics" className="text-xl font-semibold text-foreground flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          Contractor Analytics
        </h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Contractor Table */}
          <Card data-testid="contractor-table-card" className="hover-elevate">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5 text-primary" />
                  Top Contractors
                </CardTitle>
                <Select value={contractorSortBy} onValueChange={(value: ContractorSortType) => {
                  setContractorSortBy(value);
                  setContractorPage(1);
                }} data-testid="select-contractor-sort">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mostProjects">Most Projects</SelectItem>
                    <SelectItem value="fewestProjects">Fewest Projects</SelectItem>
                    <SelectItem value="highestCost">Highest Cost</SelectItem>
                    <SelectItem value="lowestCost">Lowest Cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Contractor Name</TableHead>
                        <TableHead className="text-right">Projects</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentContractorData.map((contractor, index) => (
                        <TableRow key={contractor.name} data-testid={`row-contractor-${contractor.name.replace(/\s+/g, '-').toLowerCase()}`}>
                          <TableCell className="font-medium">
                            {startContractorIndex + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px]">
                              <div className="truncate" title={contractor.name}>
                                {contractor.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {contractor.completed} completed, {contractor.ongoing} ongoing
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium" data-testid={`text-projects-${contractor.name.replace(/\s+/g, '-').toLowerCase()}`}>
                            {contractor.projectCount}
                          </TableCell>
                          <TableCell className="text-right font-medium" data-testid={`text-cost-${contractor.name.replace(/\s+/g, '-').toLowerCase()}`}>
                            ₱{(contractor.totalCost / 1000000).toFixed(1)}M
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalContractorPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startContractorIndex + 1} to {Math.min(endContractorIndex, sortedContractorData.length)} of {sortedContractorData.length} contractors
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContractorPage(prev => Math.max(prev - 1, 1))}
                        disabled={contractorPage === 1}
                        data-testid="button-contractor-prev"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalContractorPages) }, (_, i) => {
                          const pageNum = contractorPage <= 3 ? i + 1 : 
                                         contractorPage >= totalContractorPages - 2 ? totalContractorPages - 4 + i :
                                         contractorPage - 2 + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={contractorPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContractorPage(pageNum)}
                              className="w-8 h-8 p-0"
                              data-testid={`button-contractor-page-${pageNum}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContractorPage(prev => Math.min(prev + 1, totalContractorPages))}
                        disabled={contractorPage === totalContractorPages}
                        data-testid="button-contractor-next"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contractor Chart */}
          <Card data-testid="contractor-chart-card" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {getSortLabel(contractorSortBy)} - Chart
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Top 10 contractors by {getSortLabel(contractorSortBy).toLowerCase()}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={contractorChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: getChartYAxisLabel(), 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px' }
                    }}
                  />
                  <Tooltip content={<ContractorTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={chartColors.primary} 
                    radius={[4, 4, 0, 0]} 
                    cursor="pointer"
                  >
                    {contractorChartData.map((entry, index) => (
                      <Cell 
                        key={`contractor-chart-cell-${index}`}
                        data-testid={`bar-contractor-${entry.name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}