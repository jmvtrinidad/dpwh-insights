import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Building, Users, Calendar, MapPin, CheckCircle, Clock, AlertCircle, BarChart3 } from 'lucide-react';

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
  onFilterChange?: (key: 'region'|'implementingOffice'|'province'|'municipality'|'barangay'|'status'|'year', value: string) => void;
}

export default function AnalyticsDashboard({ projects, isLoading = false, onFilterChange }: AnalyticsDashboardProps) {
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
    </div>
  );
}