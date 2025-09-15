import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectsByYearList from './ProjectsByYearList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Building,
  Users,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  HardHat,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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
  onFilterChange?: (
    key:
      | 'region'
      | 'implementingOffice'
      | 'contractor'
      | 'province'
      | 'municipality'
      | 'barangay'
      | 'status'
      | 'year',
    value: string
  ) => void;
}

type ContractorSortType =
  | 'mostProjects'
  | 'fewestProjects'
  | 'highestCost'
  | 'lowestCost';
type LocationMetricType = 'count' | 'cost';

interface ContractorData {
  name: string;
  projectCount: number;
  totalCost: number;
  completed: number;
  ongoing: number;
}

export default function AnalyticsDashboard({
  projects,
  isLoading = false,
  onFilterChange,
}: AnalyticsDashboardProps) {
  const [contractorSortBy, setContractorSortBy] =
    useState<ContractorSortType>('highestCost');
  const [contractorSortDirection, setContractorSortDirection] = useState<
    'asc' | 'desc'
  >('desc');
  const [contractorPage, setContractorPage] = useState(1);
  const [locationMetric, setLocationMetric] =
    useState<LocationMetricType>('count');
  const [locationView, setLocationView] = useState<'chart' | 'list'>('list');
  const [regionSortBy, setRegionSortBy] = useState<'count' | 'cost'>('cost');
  const [regionSortDirection, setRegionSortDirection] = useState<
    'asc' | 'desc'
  >('desc');
  const [regionPageSize, setRegionPageSize] = useState(10);
  const [regionPage, setRegionPage] = useState(1);
  const [officeSortBy, setOfficeSortBy] = useState<'count' | 'cost'>('cost');
  const [officeSortDirection, setOfficeSortDirection] = useState<
    'asc' | 'desc'
  >('desc');
  const [officePageSize, setOfficePageSize] = useState(10);
  const [officePage, setOfficePage] = useState(1);
  const [contractorPageSize, setContractorPageSize] = useState(10);
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
  const completedProjects = projects.filter(
    (p) => p.status.toLowerCase() === 'completed'
  ).length;
  const ongoingProjects = projects.filter(
    (p) => p.status.toLowerCase() === 'on-going'
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + p.contractCost, 0);
  const completionRate =
    totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

  // Process contractor data with project count and total cost
  const getContractorData = (): ContractorData[] => {
    const contractorMap = new Map<string, ContractorData>();

    projects.forEach((project) => {
      project.contractor.forEach((contractorName) => {
        if (!contractorMap.has(contractorName)) {
          contractorMap.set(contractorName, {
            name: contractorName,
            projectCount: 0,
            totalCost: 0,
            completed: 0,
            ongoing: 0,
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
    let comparison = 0;
    switch (contractorSortBy) {
      case 'mostProjects':
      case 'fewestProjects':
        comparison = a.projectCount - b.projectCount;
        break;
      case 'highestCost':
      case 'lowestCost':
        comparison = a.totalCost - b.totalCost;
        break;
      default:
        comparison = a.projectCount - b.projectCount;
    }

    // Apply direction - for descending sorts, we want highest first (negative comparison)
    // For ascending sorts, we want lowest first (positive comparison)
    if (contractorSortDirection === 'desc') {
      return -comparison; // Sort descending (highest/most first)
    } else {
      return comparison; // Sort ascending (lowest/fewest first)
    }
  });

  // Helper function for contractor sorting
  const handleContractorSort = (sortType: ContractorSortType) => {
    if (contractorSortBy === sortType) {
      setContractorSortDirection(
        contractorSortDirection === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setContractorSortBy(sortType);
      setContractorSortDirection('desc');
    }
  };

  // Helper function to get contractor sort icon
  const getContractorSortIcon = (column: ContractorSortType) => {
    if (contractorSortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return contractorSortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Prepare chart data based on sort type
  const getContractorChartData = () => {
    const topContractors = sortedContractorData.slice(0, 10); // Top 10 for chart

    return topContractors.map((contractor) => ({
      name:
        contractor.name.length > 20
          ? contractor.name.substring(0, 20) + '...'
          : contractor.name,
      fullName: contractor.name,
      value: contractorSortBy.includes('Cost')
        ? contractor.totalCost / 1000000
        : contractor.projectCount,
      projectCount: contractor.projectCount,
      totalCost: contractor.totalCost,
    }));
  };

  const contractorChartData = getContractorChartData();

  // Custom tooltip for contractor chart
  const ContractorTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-md max-w-xs">
          <p className="font-medium text-card-foreground text-sm">
            {data.fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            Projects: {data.projectCount}
          </p>
          <p className="text-sm text-muted-foreground">
            Total Cost: {formatCost(data.totalCost)}
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
        project.contractor.forEach((contractor) => {
          if (!acc[contractor]) {
            acc[contractor] = {
              name: contractor,
              count: 0,
              completed: 0,
              ongoing: 0,
              totalCost: 0,
            };
          }
          acc[contractor].count++;
          acc[contractor].totalCost += project.contractCost;
          if (project.status.toLowerCase() === 'completed')
            acc[contractor].completed++;
          if (project.status.toLowerCase() === 'on-going')
            acc[contractor].ongoing++;
        });
      } else {
        const key = project[groupBy] as string;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            count: 0,
            completed: 0,
            ongoing: 0,
            totalCost: 0,
          };
        }
        acc[key].count++;
        acc[key].totalCost += project.contractCost;
        if (project.status.toLowerCase() === 'completed') acc[key].completed++;
        if (project.status.toLowerCase() === 'on-going') acc[key].ongoing++;
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; completed: number; ongoing: number; totalCost: number }>);

    return Object.values(grouped)
      .sort((a, b) =>
        locationMetric === 'cost'
          ? b.totalCost - a.totalCost
          : b.count - a.count
      )
      .slice(0, 8); // Top 8 for better visualization
  };

  const chartColors = {
    primary: '#0066CC',
    secondary: '#228B22',
    warning: '#FFC107',
    accent: '#6C757D',
  };

  // Helper function to get formatted chart data
  const getFormattedChartData = (data: any[]) => {
    return data.map((item) => ({
      ...item,
      value: locationMetric === 'cost' ? item.totalCost / 1000000 : item.count,
      displayValue: locationMetric === 'cost' ? item.totalCost : item.count,
    }));
  };

  const regionData = getFormattedChartData(getChartData('region', 'Region'));
  const statusData = getFormattedChartData(getChartData('status', 'Status'));
  const yearData = getFormattedChartData(getChartData('year', 'Year'));
  const officeData = getFormattedChartData(
    getChartData('implementingOffice', 'Office')
  );

  // Prepare location data for list view - get all regions and implementing offices
  const getAllRegions = () => {
    const grouped = projects.reduce((acc, project) => {
      const key = project.region;
      if (!acc[key]) {
        acc[key] = { name: key, count: 0, totalCost: 0 };
      }
      acc[key].count++;
      acc[key].totalCost += project.contractCost;
      return acc;
    }, {} as Record<string, { name: string; count: number; totalCost: number }>);

    return Object.values(grouped);
  };

  const getAllImplementingOffices = () => {
    const grouped = projects.reduce((acc, project) => {
      const key = project.implementingOffice;
      if (!acc[key]) {
        acc[key] = { name: key, count: 0, totalCost: 0 };
      }
      acc[key].count++;
      acc[key].totalCost += project.contractCost;
      return acc;
    }, {} as Record<string, { name: string; count: number; totalCost: number }>);

    return Object.values(grouped);
  };

  const allRegions = getAllRegions();
  const allImplementingOffices = getAllImplementingOffices();

  // Sort regions and implementing offices
  const sortedRegions = [...allRegions].sort((a, b) => {
    let comparison = 0;
    if (regionSortBy === 'cost') {
      comparison = a.totalCost - b.totalCost;
    } else {
      comparison = a.count - b.count;
    }
    return regionSortDirection === 'asc' ? comparison : -comparison;
  });

  const sortedImplementingOffices = [...allImplementingOffices].sort((a, b) => {
    let comparison = 0;
    if (officeSortBy === 'cost') {
      comparison = a.totalCost - b.totalCost;
    } else {
      comparison = a.count - b.count;
    }
    return officeSortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination for regions
  const totalRegionPages = Math.ceil(sortedRegions.length / regionPageSize);
  const startRegionIndex = (regionPage - 1) * regionPageSize;
  const endRegionIndex = startRegionIndex + regionPageSize;
  const currentRegions = sortedRegions.slice(startRegionIndex, endRegionIndex);

  // Pagination for implementing offices
  const totalOfficePages = Math.ceil(
    sortedImplementingOffices.length / officePageSize
  );
  const startOfficeIndex = (officePage - 1) * officePageSize;
  const endOfficeIndex = startOfficeIndex + officePageSize;
  const currentOffices = sortedImplementingOffices.slice(
    startOfficeIndex,
    endOfficeIndex
  );

  // Pagination for contractors
  const totalContractorPages = Math.ceil(
    sortedContractorData.length / contractorPageSize
  );
  const startContractorIndex = (contractorPage - 1) * contractorPageSize;
  const endContractorIndex = startContractorIndex + contractorPageSize;
  const currentContractors = sortedContractorData.slice(
    startContractorIndex,
    endContractorIndex
  );

  // Helper functions for sorting
  const handleRegionSort = (column: 'count' | 'cost') => {
    if (regionSortBy === column) {
      setRegionSortDirection(regionSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setRegionSortBy(column);
      setRegionSortDirection('desc');
    }
  };

  const handleOfficeSort = (column: 'count' | 'cost') => {
    if (officeSortBy === column) {
      setOfficeSortDirection(officeSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOfficeSortBy(column);
      setOfficeSortDirection('desc');
    }
  };

  // Helper function to get sort icon
  const getSortIcon = (
    column: 'count' | 'cost',
    currentSort: 'count' | 'cost',
    direction: 'asc' | 'desc'
  ) => {
    if (currentSort !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Helper function to format cost with appropriate units
  const formatCost = (cost: number): string => {
    const absCost = Math.abs(cost);

    if (absCost >= 1000000000000) {
      // Trillions
      return `₱${(cost / 1000000000000).toFixed(1)}T`;
    } else if (absCost >= 1000000000) {
      // Billions
      return `₱${(cost / 1000000000).toFixed(1)}B`;
    } else if (absCost >= 1000000) {
      // Millions
      return `₱${(cost / 1000000).toFixed(1)}M`;
    } else if (absCost >= 1000) {
      // Thousands
      return `₱${(cost / 1000).toFixed(1)}K`;
    } else {
      return `₱${cost.toLocaleString()}`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-md p-3 shadow-md">
          <p className="font-medium text-card-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Total Projects: {data.count}
          </p>
          <p className="text-sm text-muted-foreground">
            Total Cost: {formatCost(data.totalCost)}
          </p>
        </div>
      );

      return (
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card data-testid="metric-total-projects" className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Projects
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {totalProjects.toLocaleString()}
                        </p>
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
                        <p className="text-sm font-medium text-muted-foreground">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {completedProjects.toLocaleString()}
                        </p>
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
                        <p className="text-sm font-medium text-muted-foreground">
                          On-going
                        </p>
                        <p className="text-2xl font-bold text-amber-600">
                          {ongoingProjects.toLocaleString()}
                        </p>
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
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Budget
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCost(totalBudget)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {totalBudget >= 1000000000000
                          ? 'Trillions'
                          : totalBudget >= 1000000000
                          ? 'Billions'
                          : totalBudget >= 1000000
                          ? 'Millions'
                          : totalBudget >= 1000
                          ? 'Thousands'
                          : ''}{' '}
                        pesos
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Location Analytics Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2
                    data-testid="header-location-analytics"
                    className="text-xl font-semibold text-foreground flex items-center gap-2"
                  >
                    <MapPin className="h-6 w-6 text-primary" />
                    Location Analytics
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant={locationView === 'chart' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLocationView('chart')}
                        className="rounded-r-none"
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Chart
                      </Button>
                      <Button
                        variant={locationView === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setLocationView('list')}
                        className="rounded-l-none"
                      >
                        <TableIcon className="h-4 w-4 mr-1" />
                        List
                      </Button>
                    </div>
                    <Select
                      value={locationMetric}
                      onValueChange={(value: LocationMetricType) =>
                        setLocationMetric(value)
                      }
                      data-testid="select-location-metric"
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Total Projects</SelectItem>
                        <SelectItem value="cost">Project Cost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {locationView === 'chart' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            <YAxis
                              tick={{ fontSize: 12 }}
                              label={{
                                value:
                                  locationMetric === 'cost'
                                    ? 'Cost (Millions ₱)'
                                    : 'Number of Projects',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: '12px' },
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="value"
                              fill={chartColors.primary}
                              radius={[4, 4, 0, 0]}
                              cursor="pointer"
                            >
                              {regionData.map((entry, index) => (
                                <Cell
                                  key={`region-cell-${index}`}
                                  data-testid={`bar-region-${entry.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
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
                            <YAxis
                              tick={{ fontSize: 12 }}
                              label={{
                                value:
                                  locationMetric === 'cost'
                                    ? 'Cost (Millions ₱)'
                                    : 'Number of Projects',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: '12px' },
                              }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                              dataKey="value"
                              fill={chartColors.accent}
                              radius={[4, 4, 0, 0]}
                              cursor="pointer"
                            >
                              {officeData.map((entry, index) => (
                                <Cell
                                  key={`office-cell-${index}`}
                                  data-testid={`bar-implementingOffice-${entry.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
                                  onClick={() =>
                                    onFilterChange?.('implementingOffice', entry.name)
                                  }
                                  className="hover:opacity-80"
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Regions Table */}
                    <Card data-testid="regions-table-card" className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Regions ({sortedRegions.length})
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Click column headers to sort • Currently sorted by{' '}
                          {regionSortBy === 'cost' ? 'total cost' : 'total projects'} (
                          {regionSortDirection === 'asc' ? 'ascending' : 'descending'})
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">#</TableHead>
                                <TableHead>Region Name</TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleRegionSort('count')}
                                >
                                  <div className="flex items-center justify-end">
                                    Total Projects
                                    {getSortIcon(
                                      'count',
                                      regionSortBy,
                                      regionSortDirection
                                    )}
                                  </div>
                                </TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleRegionSort('cost')}
                                >
                                  <div className="flex items-center justify-end">
                                    Total Cost
                                    {getSortIcon(
                                      'cost',
                                      regionSortBy,
                                      regionSortDirection
                                    )}
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentRegions.map((region, index) => (
                                <TableRow
                                  key={region.name}
                                  data-testid={`row-region-${region.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
                                >
                                  <TableCell className="font-medium">
                                    {startRegionIndex + index + 1}
                                  </TableCell>
                                  <TableCell
                                    className="font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                                    title={region.name}
                                    onClick={() => onFilterChange?.('region', region.name)}
                                  >
                                    {region.name}
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-projects-${region.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {region.count}
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-cost-${region.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {formatCost(region.totalCost)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination and Page Size Controls */}
                        <div className="mt-4 space-y-3">
                          {/* Mobile-first responsive layout */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Page size selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Show</span>
                              <Select value={regionPageSize.toString()} onValueChange={(value) => {
                                setRegionPageSize(Number(value));
                                setRegionPage(1);
                              }}>
                                <SelectTrigger className="w-16 sm:w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                              <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                            </div>

                            {/* Item count - hidden on very small screens */}
                            <div className="hidden md:flex items-center">
                              <span className="text-sm text-muted-foreground">
                                {startRegionIndex + 1}-{Math.min(endRegionIndex, sortedRegions.length)} of {sortedRegions.length}
                              </span>
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-center sm:justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRegionPage(prev => Math.max(prev - 1, 1))}
                                disabled={regionPage === 1}
                                className="px-2 sm:px-3"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Prev</span>
                              </Button>

                              {/* Page numbers */}
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalRegionPages) }, (_, i) => {
                                  const pageNum = regionPage <= 3 ? i + 1 :
                                                  regionPage >= totalRegionPages - 2 ? totalRegionPages - 4 + i :
                                                  regionPage - 2 + i;
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={regionPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setRegionPage(pageNum)}
                                      className="w-8 h-8 p-0 text-xs"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRegionPage(prev => Math.min(prev + 1, totalRegionPages))}
                                disabled={regionPage === totalRegionPages}
                                className="px-2 sm:px-3"
                              >
                                <span className="hidden sm:inline mr-1">Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Mobile item count - shown below on small screens */}
                          <div className="flex justify-center md:hidden">
                            <span className="text-xs text-muted-foreground">
                              {startRegionIndex + 1}-{Math.min(endRegionIndex, sortedRegions.length)} of {sortedRegions.length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Implementing Offices Table */}
                    <Card data-testid="offices-table-card" className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Implementing Offices ({sortedImplementingOffices.length})
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Click column headers to sort • Currently sorted by{' '}
                          {officeSortBy === 'cost' ? 'total cost' : 'total projects'} (
                          {officeSortDirection === 'asc' ? 'ascending' : 'descending'})
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">#</TableHead>
                                <TableHead>Office Name</TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleOfficeSort('count')}
                                >
                                  <div className="flex items-center justify-end">
                                    Total Projects
                                    {getSortIcon(
                                      'count',
                                      officeSortBy,
                                      officeSortDirection
                                    )}
                                  </div>
                                </TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleOfficeSort('cost')}
                                >
                                  <div className="flex items-center justify-end">
                                    Total Cost
                                    {getSortIcon(
                                      'cost',
                                      officeSortBy,
                                      officeSortDirection
                                    )}
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentOffices.map((office, index) => (
                                <TableRow
                                  key={office.name}
                                  data-testid={`row-office-${office.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
                                >
                                  <TableCell className="font-medium">
                                    {startOfficeIndex + index + 1}
                                  </TableCell>
                                  <TableCell
                                    className="font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                                    title={office.name}
                                    onClick={() => onFilterChange?.('implementingOffice', office.name)}
                                  >
                                    {office.name}
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-projects-${office.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {office.count}
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-cost-${office.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {formatCost(office.totalCost)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination and Page Size Controls */}
                        <div className="mt-4 space-y-3">
                          {/* Mobile-first responsive layout */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Page size selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Show</span>
                              <Select value={officePageSize.toString()} onValueChange={(value) => {
                                setOfficePageSize(Number(value));
                                setOfficePage(1);
                              }}>
                                <SelectTrigger className="w-16 sm:w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                              <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                            </div>

                            {/* Item count - hidden on very small screens */}
                            <div className="hidden md:flex items-center">
                              <span className="text-sm text-muted-foreground">
                                {startOfficeIndex + 1}-{Math.min(endOfficeIndex, sortedImplementingOffices.length)} of {sortedImplementingOffices.length}
                              </span>
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-center sm:justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOfficePage(prev => Math.max(prev - 1, 1))}
                                disabled={officePage === 1}
                                className="px-2 sm:px-3"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Prev</span>
                              </Button>

                              {/* Page numbers */}
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalOfficePages) }, (_, i) => {
                                  const pageNum = officePage <= 3 ? i + 1 :
                                                  officePage >= totalOfficePages - 2 ? totalOfficePages - 4 + i :
                                                  officePage - 2 + i;
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={officePage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setOfficePage(pageNum)}
                                      className="w-8 h-8 p-0 text-xs"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOfficePage(prev => Math.min(prev + 1, totalOfficePages))}
                                disabled={officePage === totalOfficePages}
                                className="px-2 sm:px-3"
                              >
                                <span className="hidden sm:inline mr-1">Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Mobile item count - shown below on small screens */}
                          <div className="flex justify-center md:hidden">
                            <span className="text-xs text-muted-foreground">
                              {startOfficeIndex + 1}-{Math.min(endOfficeIndex, sortedImplementingOffices.length)} of {sortedImplementingOffices.length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
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
                          <Bar
                            dataKey="count"
                            fill={chartColors.secondary}
                            radius={[4, 4, 0, 0]}
                            cursor="pointer"
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={`status-cell-${index}`}
                                data-testid={`bar-status-${entry.name
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()}`}
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
                          <Bar
                            dataKey="count"
                            fill={chartColors.warning}
                            radius={[4, 4, 0, 0]}
                            cursor="pointer"
                          >
                            {yearData.map((entry, index) => (
                              <Cell
                                key={`year-cell-${index}`}
                                data-testid={`bar-year-${entry.name
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()}`}
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

              {/* Projects by Year List Section */}
              <div className="space-y-6">
                <ProjectsByYearList projects={projects} isLoading={isLoading} />
              </div>

              {/* Contractor Analytics Section */}
              <div className="space-y-6">
                <h2
                  data-testid="header-contractor-analytics"
                  className="text-xl font-semibold text-foreground flex items-center gap-2"
                >
                  <HardHat className="h-6 w-6 text-primary" />
                  Contractor Analytics
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Contractor Table */}
                  <Card data-testid="contractor-table-card" className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardHat className="h-5 w-5 text-primary" />
                        Top Contractors
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Click column headers to sort • Currently sorted by{' '}
                        {getSortLabel(contractorSortBy).toLowerCase()} (
                        {contractorSortDirection === 'asc' ? 'ascending' : 'descending'}
                        )
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">#</TableHead>
                                <TableHead>Contractor Name</TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleContractorSort('mostProjects')}
                                >
                                  <div className="flex items-center justify-end">
                                    Projects
                                    {getContractorSortIcon('mostProjects')}
                                  </div>
                                </TableHead>
                                <TableHead
                                  className="text-right cursor-pointer hover:bg-muted/50 select-none"
                                  onClick={() => handleContractorSort('highestCost')}
                                >
                                  <div className="flex items-center justify-end">
                                    Total Cost
                                    {getContractorSortIcon('highestCost')}
                                  </div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentContractors.map((contractor, index) => (
                                <TableRow
                                  key={contractor.name}
                                  data-testid={`row-contractor-${contractor.name
                                    .replace(/\s+/g, '-')
                                    .toLowerCase()}`}
                                >
                                  <TableCell className="font-medium">
                                    {startContractorIndex + index + 1}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    <div
                                      className="cursor-pointer hover:bg-muted/50 transition-colors rounded px-1 py-0.5 -mx-1 -my-0.5"
                                      title={contractor.name}
                                      onClick={() => onFilterChange?.('contractor', contractor.name)}
                                    >
                                      {contractor.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {contractor.completed} completed,{' '}
                                      {contractor.ongoing} ongoing
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-projects-${contractor.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {contractor.projectCount}
                                  </TableCell>
                                  <TableCell
                                    className="text-right font-medium"
                                    data-testid={`text-cost-${contractor.name
                                      .replace(/\s+/g, '-')
                                      .toLowerCase()}`}
                                  >
                                    {formatCost(contractor.totalCost)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination and Page Size Controls */}
                        <div className="mt-4 space-y-3">
                          {/* Mobile-first responsive layout */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Page size selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Show</span>
                              <Select value={contractorPageSize.toString()} onValueChange={(value) => {
                                setContractorPageSize(Number(value));
                                setContractorPage(1);
                              }}>
                                <SelectTrigger className="w-16 sm:w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                              <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                            </div>

                            {/* Item count - hidden on very small screens */}
                            <div className="hidden md:flex items-center">
                              <span className="text-sm text-muted-foreground">
                                {startContractorIndex + 1}-{Math.min(endContractorIndex, sortedContractorData.length)} of {sortedContractorData.length}
                              </span>
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-center sm:justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setContractorPage(prev => Math.max(prev - 1, 1))}
                                disabled={contractorPage === 1}
                                className="px-2 sm:px-3"
                                data-testid="button-contractor-prev"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">Prev</span>
                              </Button>

                              {/* Page numbers */}
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
                                      className="w-8 h-8 p-0 text-xs"
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
                                className="px-2 sm:px-3"
                                data-testid="button-contractor-next"
                              >
                                <span className="hidden sm:inline mr-1">Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Mobile item count - shown below on small screens */}
                          <div className="flex justify-center md:hidden">
                            <span className="text-xs text-muted-foreground">
                              {startContractorIndex + 1}-{Math.min(endContractorIndex, sortedContractorData.length)} of {sortedContractorData.length}
                            </span>
                          </div>
                        </div>
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
                        Top 10 contractors by{' '}
                        {getSortLabel(contractorSortBy).toLowerCase()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={contractorChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                        >
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
                              style: { textAnchor: 'middle', fontSize: '12px' },
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
                                data-testid={`bar-contractor-${entry.name
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()}`}
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
          </div>

          {/* Footer with Data Source Disclaimer */}
          <footer className="mt-8 py-6 border-t border-border bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  <strong>Data Source Disclaimer:</strong> All data from 2016 up to August 2025 is sourced from{' '}
                  <a
                    href="https://apps2.dpwh.gov.ph/infra_projects/default.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    https://apps2.dpwh.gov.ph/infra_projects/default.aspx
                  </a>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Department of Public Works and Highways (DPWH) Infrastructure Projects Database
                </p>
              </div>
            </div>
          </footer>
        </div>
      );
    }
    return null;
  };

  const getSortLabel = (sortType: ContractorSortType) => {
    switch (sortType) {
      case 'mostProjects':
        return 'Most Projects';
      case 'fewestProjects':
        return 'Fewest Projects';
      case 'highestCost':
        return 'Highest Cost';
      case 'lowestCost':
        return 'Lowest Cost';
      default:
        return 'Most Projects';
    }
  };

  const getChartYAxisLabel = () => {
    return contractorSortBy.includes('Cost')
      ? 'Cost (Millions ₱)'
      : 'Number of Projects';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="metric-total-projects" className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalProjects.toLocaleString()}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completedProjects.toLocaleString()}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  On-going
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {ongoingProjects.toLocaleString()}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCost(totalBudget)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {totalBudget >= 1000000000000
                  ? 'Trillions'
                  : totalBudget >= 1000000000
                  ? 'Billions'
                  : totalBudget >= 1000000
                  ? 'Millions'
                  : totalBudget >= 1000
                  ? 'Thousands'
                  : ''}{' '}
                pesos
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Analytics Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2
            data-testid="header-location-analytics"
            className="text-xl font-semibold text-foreground flex items-center gap-2"
          >
            <MapPin className="h-6 w-6 text-primary" />
            Location Analytics
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={locationView === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocationView('chart')}
                className="rounded-r-none"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Chart
              </Button>
              <Button
                variant={locationView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocationView('list')}
                className="rounded-l-none"
              >
                <TableIcon className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
            <Select
              value={locationMetric}
              onValueChange={(value: LocationMetricType) =>
                setLocationMetric(value)
              }
              data-testid="select-location-metric"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">Total Projects</SelectItem>
                <SelectItem value="cost">Project Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {locationView === 'chart' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value:
                          locationMetric === 'cost'
                            ? 'Cost (Millions ₱)'
                            : 'Number of Projects',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '12px' },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill={chartColors.primary}
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                    >
                      {regionData.map((entry, index) => (
                        <Cell
                          key={`region-cell-${index}`}
                          data-testid={`bar-region-${entry.name
                            .replace(/\s+/g, '-')
                            .toLowerCase()}`}
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
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value:
                          locationMetric === 'cost'
                            ? 'Cost (Millions ₱)'
                            : 'Number of Projects',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '12px' },
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill={chartColors.accent}
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                    >
                      {officeData.map((entry, index) => (
                        <Cell
                          key={`office-cell-${index}`}
                          data-testid={`bar-implementingOffice-${entry.name
                            .replace(/\s+/g, '-')
                            .toLowerCase()}`}
                          onClick={() =>
                            onFilterChange?.('implementingOffice', entry.name)
                          }
                          className="hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Regions Table */}
            <Card data-testid="regions-table-card" className="hover-elevate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Regions ({sortedRegions.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click column headers to sort • Currently sorted by{' '}
                  {regionSortBy === 'cost' ? 'total cost' : 'total projects'} (
                  {regionSortDirection === 'asc' ? 'ascending' : 'descending'})
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Region Name</TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleRegionSort('count')}
                        >
                          <div className="flex items-center justify-end">
                            Total Projects
                            {getSortIcon(
                              'count',
                              regionSortBy,
                              regionSortDirection
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleRegionSort('cost')}
                        >
                          <div className="flex items-center justify-end">
                            Total Cost
                            {getSortIcon(
                              'cost',
                              regionSortBy,
                              regionSortDirection
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRegions.map((region, index) => (
                        <TableRow
                          key={region.name}
                          data-testid={`row-region-${region.name
                            .replace(/\s+/g, '-')
                            .toLowerCase()}`}
                        >
                          <TableCell className="font-medium">
                            {startRegionIndex + index + 1}
                          </TableCell>
                          <TableCell
                            className="font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                            title={region.name}
                            onClick={() => onFilterChange?.('region', region.name)}
                          >
                            {region.name}
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-projects-${region.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {region.count}
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-cost-${region.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {formatCost(region.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination and Page Size Controls */}
                <div className="mt-4 space-y-3">
                  {/* Mobile-first responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Page size selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show</span>
                      <Select value={regionPageSize.toString()} onValueChange={(value) => {
                        setRegionPageSize(Number(value));
                        setRegionPage(1);
                      }}>
                        <SelectTrigger className="w-16 sm:w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                      <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                    </div>

                    {/* Item count - hidden on very small screens */}
                    <div className="hidden md:flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {startRegionIndex + 1}-{Math.min(endRegionIndex, sortedRegions.length)} of {sortedRegions.length}
                      </span>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-center sm:justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRegionPage(prev => Math.max(prev - 1, 1))}
                        disabled={regionPage === 1}
                        className="px-2 sm:px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Prev</span>
                      </Button>

                      {/* Page numbers - responsive count */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalRegionPages) }, (_, i) => {
                          const pageNum = regionPage <= 3 ? i + 1 :
                                          regionPage >= totalRegionPages - 2 ? totalRegionPages - 4 + i :
                                          regionPage - 2 + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={regionPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setRegionPage(pageNum)}
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRegionPage(prev => Math.min(prev + 1, totalRegionPages))}
                        disabled={regionPage === totalRegionPages}
                        className="px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile item count - shown below on small screens */}
                  <div className="flex justify-center md:hidden">
                    <span className="text-xs text-muted-foreground">
                      {startRegionIndex + 1}-{Math.min(endRegionIndex, sortedRegions.length)} of {sortedRegions.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementing Offices Table */}
            <Card data-testid="offices-table-card" className="hover-elevate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Implementing Offices ({sortedImplementingOffices.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click column headers to sort • Currently sorted by{' '}
                  {officeSortBy === 'cost' ? 'total cost' : 'total projects'} (
                  {officeSortDirection === 'asc' ? 'ascending' : 'descending'})
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Office Name</TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleOfficeSort('count')}
                        >
                          <div className="flex items-center justify-end">
                            Total Projects
                            {getSortIcon(
                              'count',
                              officeSortBy,
                              officeSortDirection
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleOfficeSort('cost')}
                        >
                          <div className="flex items-center justify-end">
                            Total Cost
                            {getSortIcon(
                              'cost',
                              officeSortBy,
                              officeSortDirection
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOffices.map((office, index) => (
                        <TableRow
                          key={office.name}
                          data-testid={`row-office-${office.name
                            .replace(/\s+/g, '-')
                            .toLowerCase()}`}
                        >
                          <TableCell className="font-medium">
                            {startOfficeIndex + index + 1}
                          </TableCell>
                          <TableCell
                            className="font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                            title={office.name}
                            onClick={() => onFilterChange?.('implementingOffice', office.name)}
                          >
                            {office.name}
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-projects-${office.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {office.count}
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-cost-${office.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {formatCost(office.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination and Page Size Controls */}
                <div className="mt-4 space-y-3">
                  {/* Mobile-first responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Page size selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show</span>
                      <Select value={officePageSize.toString()} onValueChange={(value) => {
                        setOfficePageSize(Number(value));
                        setOfficePage(1);
                      }}>
                        <SelectTrigger className="w-16 sm:w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                      <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                    </div>

                    {/* Item count - hidden on very small screens */}
                    <div className="hidden md:flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {startOfficeIndex + 1}-{Math.min(endOfficeIndex, sortedImplementingOffices.length)} of {sortedImplementingOffices.length}
                      </span>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-center sm:justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOfficePage(prev => Math.max(prev - 1, 1))}
                        disabled={officePage === 1}
                        className="px-2 sm:px-3"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Prev</span>
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalOfficePages) }, (_, i) => {
                          const pageNum = officePage <= 3 ? i + 1 :
                                          officePage >= totalOfficePages - 2 ? totalOfficePages - 4 + i :
                                          officePage - 2 + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={officePage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setOfficePage(pageNum)}
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOfficePage(prev => Math.min(prev + 1, totalOfficePages))}
                        disabled={officePage === totalOfficePages}
                        className="px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile item count - shown below on small screens */}
                  <div className="flex justify-center md:hidden">
                    <span className="text-xs text-muted-foreground">
                      {startOfficeIndex + 1}-{Math.min(endOfficeIndex, sortedImplementingOffices.length)} of {sortedImplementingOffices.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
                  <Bar
                    dataKey="count"
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`status-cell-${index}`}
                        data-testid={`bar-status-${entry.name
                          .replace(/\s+/g, '-')
                          .toLowerCase()}`}
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
                  <Bar
                    dataKey="count"
                    fill={chartColors.warning}
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  >
                    {yearData.map((entry, index) => (
                      <Cell
                        key={`year-cell-${index}`}
                        data-testid={`bar-year-${entry.name
                          .replace(/\s+/g, '-')
                          .toLowerCase()}`}
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
        <h2
          data-testid="header-contractor-analytics"
          className="text-xl font-semibold text-foreground flex items-center gap-2"
        >
          <HardHat className="h-6 w-6 text-primary" />
          Contractor Analytics
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Contractor Table */}
          <Card data-testid="contractor-table-card" className="hover-elevate">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-primary" />
                Top Contractors
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click column headers to sort • Currently sorted by{' '}
                {getSortLabel(contractorSortBy).toLowerCase()} (
                {contractorSortDirection === 'asc' ? 'ascending' : 'descending'}
                )
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Contractor Name</TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleContractorSort('mostProjects')}
                        >
                          <div className="flex items-center justify-end">
                            Projects
                            {getContractorSortIcon('mostProjects')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleContractorSort('highestCost')}
                        >
                          <div className="flex items-center justify-end">
                            Total Cost
                            {getContractorSortIcon('highestCost')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentContractors.map((contractor, index) => (
                        <TableRow
                          key={contractor.name}
                          data-testid={`row-contractor-${contractor.name
                            .replace(/\s+/g, '-')
                            .toLowerCase()}`}
                        >
                          <TableCell className="font-medium">
                            {startContractorIndex + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div
                              className="cursor-pointer hover:bg-muted/50 transition-colors rounded px-1 py-0.5 -mx-1 -my-0.5"
                              title={contractor.name}
                              onClick={() => onFilterChange?.('contractor', contractor.name)}
                            >
                              {contractor.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {contractor.completed} completed,{' '}
                              {contractor.ongoing} ongoing
                            </div>
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-projects-${contractor.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {contractor.projectCount}
                          </TableCell>
                          <TableCell
                            className="text-right font-medium"
                            data-testid={`text-cost-${contractor.name
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`}
                          >
                            {formatCost(contractor.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination and Page Size Controls */}
                <div className="mt-4 space-y-3">
                  {/* Mobile-first responsive layout */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Page size selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show</span>
                      <Select value={contractorPageSize.toString()} onValueChange={(value) => {
                        setContractorPageSize(Number(value));
                        setContractorPage(1);
                      }}>
                        <SelectTrigger className="w-16 sm:w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
                      <span className="text-sm text-muted-foreground sm:hidden">/page</span>
                    </div>

                    {/* Item count - hidden on very small screens */}
                    <div className="hidden md:flex items-center">
                      <span className="text-sm text-muted-foreground">
                        {startContractorIndex + 1}-{Math.min(endContractorIndex, sortedContractorData.length)} of {sortedContractorData.length}
                      </span>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-center sm:justify-end space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContractorPage(prev => Math.max(prev - 1, 1))}
                        disabled={contractorPage === 1}
                        className="px-2 sm:px-3"
                        data-testid="button-contractor-prev"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Prev</span>
                      </Button>

                      {/* Page numbers */}
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
                              className="w-8 h-8 p-0 text-xs"
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
                        className="px-2 sm:px-3"
                        data-testid="button-contractor-next"
                      >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile item count - shown below on small screens */}
                  <div className="flex justify-center md:hidden">
                    <span className="text-xs text-muted-foreground">
                      {startContractorIndex + 1}-{Math.min(endContractorIndex, sortedContractorData.length)} of {sortedContractorData.length}
                    </span>
                  </div>
                </div>
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
                Top 10 contractors by{' '}
                {getSortLabel(contractorSortBy).toLowerCase()}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={contractorChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
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
                      style: { textAnchor: 'middle', fontSize: '12px' },
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
                        data-testid={`bar-contractor-${entry.name
                          .replace(/\s+/g, '-')
                          .toLowerCase()}`}
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
