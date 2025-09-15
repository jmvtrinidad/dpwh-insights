import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSidebar from "./FilterSidebar";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ProjectsTable from "./ProjectsTable";
import AdminLogin from "./AdminLogin";
import ThemeToggle from "./ThemeToggle";
import { BarChart3, Table, Settings, Filter, X } from "lucide-react";

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

interface FilterState {
  region: string;
  implementingOffice: string;
  contractor: string;
  status: string;
  year: string;
  province: string;
  municipality: string;
  barangay: string;
}

interface DashboardLayoutProps {
  projects: Project[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onDataUpload?: (files: FileList) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export default function DashboardLayout({
  projects,
  isLoading = false,
  isAuthenticated = false,
  onLogin = () => {},
  onLogout = () => {},
  onDataUpload = () => {},
  isUploading = false,
  uploadProgress = 0
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    region: '__all__',
    implementingOffice: '__all__',
    contractor: '__all__',
    status: '__all__',
    year: '__all__',
    province: '__all__',
    municipality: '__all__',
    barangay: '__all__'
  });

  // Generate filter options from projects data
  const getUniqueValues = (field: keyof Project): string[] => {
    const values = projects.map(project => project[field] as string).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const filterOptions = {
    regions: getUniqueValues('region'),
    implementingOffices: getUniqueValues('implementingOffice'),
    contractors: getUniqueValues('contractor'),
    statuses: getUniqueValues('status'),
    years: getUniqueValues('year'),
    provinces: getUniqueValues('province'),
    municipalities: getUniqueValues('municipality'),
    barangays: getUniqueValues('barangay')
  };

  // Apply filters to projects
  const filteredProjects = projects.filter(project => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '__all__') return true;
      return project[key as keyof Project] === value;
    });
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      region: '__all__',
      implementingOffice: '__all__',
      contractor: '__all__',
      status: '__all__',
      year: '__all__',
      province: '__all__',
      municipality: '__all__',
      barangay: '__all__'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== '__all__').length;

  return (
    <div className="flex h-screen bg-background">
      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        options={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card border-card-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-card-foreground">DPWH Analytics Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Department of Public Works and Highways</p>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-4" data-testid="badge-active-filters">
                  <Filter className="h-3 w-3 mr-1" />
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-4 w-4"
                    onClick={handleClearFilters}
                    data-testid="button-clear-header-filters"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" data-testid="badge-project-count">
                {filteredProjects.length} of {projects.length} projects
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-none bg-transparent p-1 text-muted-foreground mx-4 mt-2">
                <TabsTrigger 
                  value="analytics" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  data-testid="tab-analytics"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="table" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  data-testid="tab-table"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Data Table
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  data-testid="tab-admin"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="analytics" className="h-full m-0">
                <AnalyticsDashboard projects={filteredProjects} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="table" className="h-full m-0 p-6">
                <ProjectsTable projects={filteredProjects} isLoading={isLoading} />
              </TabsContent>

              <TabsContent value="admin" className="h-full m-0 p-6">
                <div className="max-w-2xl mx-auto">
                  <AdminLogin
                    isAuthenticated={isAuthenticated}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onDataUpload={onDataUpload}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}