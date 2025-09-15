import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Building, Users, Calendar, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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

interface AnalyticsDashboardProps {
  projects: Project[];
  isLoading?: boolean;
}

export default function AnalyticsDashboard({ projects, isLoading = false }: AnalyticsDashboardProps) {
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
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const ongoingProjects = projects.filter(p => p.status === 'On-going').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.contractCost, 0);
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Chart data preparation
  const getChartData = (groupBy: keyof Project, label: string) => {
    const grouped = projects.reduce((acc, project) => {
      const key = project[groupBy] as string;
      if (!acc[key]) {
        acc[key] = { name: key, count: 0, completed: 0, ongoing: 0 };
      }
      acc[key].count++;
      if (project.status === 'Completed') acc[key].completed++;
      if (project.status === 'On-going') acc[key].ongoing++;
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

      {/* Charts Grid */}
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
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <Bar dataKey="count" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
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
                <Bar dataKey="count" fill={chartColors.warning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projects by Implementing Office */}
        <Card data-testid="chart-offices" className="hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Implementing Offices
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
                <Bar dataKey="count" fill={chartColors.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}