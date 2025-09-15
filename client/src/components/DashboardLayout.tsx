import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import FilterSidebar from "./FilterSidebar";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ProjectsTable from "./ProjectsTable";
import AdminLogin from "./AdminLogin";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarChart3, Table, Settings, Filter, X, Menu } from "lucide-react";
import {
  FilterState,
  DEFAULT_FILTER_STATE,
  parseUrlParams,
  buildUrlParams,
  updateUrlWithState,
  debouncedUpdateUrlForSearch,
  updateUrlImmediately,
  debounce
} from "@/lib/utils";

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


interface DashboardLayoutProps {
  projects: Project[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onDataUpload?: (files: FileList) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  currentFileIndex?: number;
  totalFiles?: number;
}

export default function DashboardLayout({
  projects: initialProjects,
  isLoading = false,
  isAuthenticated = false,
  onLogin = () => {},
  onLogout = () => {},
  onDataUpload = () => {},
  isUploading = false,
  uploadProgress = 0,
  currentFileIndex = 0,
  totalFiles = 0
}: DashboardLayoutProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUpdatingFromUrl, setIsUpdatingFromUrl] = useState(false);
  const [filteredProjectsData, setFilteredProjectsData] = useState<Project[]>(initialProjects);
  const [isFetchingFiltered, setIsFetchingFiltered] = useState(false);

  // Track previous location search to detect URL changes
  const prevLocationSearchRef = useRef<string>('');

  // Debounced function to fetch filtered projects
  const debouncedFetchFilteredProjects = useCallback(
    debounce(async (currentFilters: FilterState) => {
      setIsFetchingFiltered(true);
      try {
        const params = new URLSearchParams();

        if (currentFilters.search && currentFilters.search.trim() !== '') {
          params.set('search', currentFilters.search);
        }
        if (currentFilters.region && currentFilters.region !== '__all__') {
          params.set('region', currentFilters.region);
        }
        if (currentFilters.implementingOffice && currentFilters.implementingOffice !== '__all__') {
          params.set('implementingOffice', currentFilters.implementingOffice);
        }
        if (currentFilters.contractor && currentFilters.contractor !== '__all__') {
          params.set('contractor', currentFilters.contractor);
        }
        if (currentFilters.status && currentFilters.status !== '__all__') {
          params.set('status', currentFilters.status);
        }
        if (currentFilters.year && currentFilters.year.length > 0) {
          params.set('year', currentFilters.year.join(','));
        }
        if (currentFilters.province && currentFilters.province !== '__all__') {
          params.set('province', currentFilters.province);
        }
        if (currentFilters.municipality && currentFilters.municipality !== '__all__') {
          params.set('municipality', currentFilters.municipality);
        }
        if (currentFilters.barangay && currentFilters.barangay !== '__all__') {
          params.set('barangay', currentFilters.barangay);
        }

        const queryString = params.toString();
        const url = queryString ? `/api/projects/filtered?${queryString}` : '/api/projects/filtered';

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch filtered projects');
        }

        const data = await response.json();
        setFilteredProjectsData(data);
      } catch (error) {
        console.error('Error fetching filtered projects:', error);
        // Fallback to initial projects if fetch fails
        setFilteredProjectsData(initialProjects);
      } finally {
        setIsFetchingFiltered(false);
      }
    }, 300),
    [initialProjects]
  );

  // Initialize sidebar state based on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Single useEffect to handle initialization from URL
  useEffect(() => {
    const fullSearch = window.location.search;

    // Initialize state from URL parameters on first load
    if (!isInitialized) {
      console.log('Initializing dashboard state from window.location.search:', fullSearch);
      const urlParams = parseUrlParams(fullSearch);
      setFilters(urlParams.filters);
      setActiveTab(urlParams.activeTab);
      prevLocationSearchRef.current = fullSearch;
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Fetch filtered projects when filters change
  useEffect(() => {
    if (isInitialized && !isUpdatingFromUrl) {
      debouncedFetchFilteredProjects(filters);
    }
  }, [filters, isInitialized, isUpdatingFromUrl, debouncedFetchFilteredProjects]);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const fullSearch = window.location.search;

      if (!isUpdatingFromUrl && fullSearch !== prevLocationSearchRef.current) {
        console.log('Browser navigation detected, updating state from window.location.search:', fullSearch);
        setIsUpdatingFromUrl(true);

        const urlParams = parseUrlParams(fullSearch);
        setFilters(urlParams.filters);
        setActiveTab(urlParams.activeTab);
        prevLocationSearchRef.current = fullSearch;

        // Reset the flag after state updates
        setIsUpdatingFromUrl(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isUpdatingFromUrl]);

  // Note: URL updates are now handled directly in handleFilterChange and tab change handlers
  // This avoids duplicate updates and provides more control over when to use debounced vs immediate updates

  // Generate filter options from projects data
  const getUniqueValues = (field: keyof Project): string[] => {
    const values = initialProjects.map(project => project[field] as string).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const filterOptions = {
    regions: getUniqueValues('region'),
    implementingOffices: getUniqueValues('implementingOffice'),
    contractors: [], // Contractors are now fetched dynamically
    statuses: getUniqueValues('status'),
    years: getUniqueValues('year'),
    provinces: getUniqueValues('province'),
    municipalities: getUniqueValues('municipality'),
    barangays: getUniqueValues('barangay')
  };

  // Use server-filtered projects data
  const filteredProjects = filteredProjectsData;

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    console.log(`Filter changed: ${key} = ${Array.isArray(value) ? value.join(',') : value}`);
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);

    // For search filter, use debounced update; for others, update immediately
    if (!isUpdatingFromUrl) {
      if (key === 'search') {
        debouncedUpdateUrlForSearch(newFilters, activeTab);
      } else {
        updateUrlImmediately(newFilters, activeTab);
      }
      const params = buildUrlParams(newFilters, activeTab);
      prevLocationSearchRef.current = params ? `?${params}` : '';
    }
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setFilters(DEFAULT_FILTER_STATE);

    // Update URL immediately when clearing filters
    if (!isUpdatingFromUrl) {
      updateUrlImmediately(DEFAULT_FILTER_STATE, activeTab);
      const params = buildUrlParams(DEFAULT_FILTER_STATE, activeTab);
      prevLocationSearchRef.current = params ? `?${params}` : '';
    }
  };

  const handleTabChange = (newTab: string) => {
    console.log(`Tab changed to: ${newTab}`);
    setActiveTab(newTab);

    // Update URL immediately when tab changes
    if (!isUpdatingFromUrl) {
      updateUrlImmediately(filters, newTab);
      const params = buildUrlParams(filters, newTab);
      prevLocationSearchRef.current = params ? `?${params}` : '';
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) =>
    key !== 'search' && value && (Array.isArray(value) ? value.length > 0 : value !== '__all__')
  ).length;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Filter Sheet */}
      {isMobile && (
        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <FilterSidebar
              filters={filters}
              options={filterOptions}
              onFilterChange={(key, value) => {
                handleFilterChange(key, value);
                if (key !== 'search') {
                  setIsMobileFiltersOpen(false);
                }
              }}
              onClearFilters={() => {
                handleClearFilters();
                setIsMobileFiltersOpen(false);
              }}
              activeFiltersCount={activeFiltersCount}
              isCollapsed={false}
              onToggle={() => {}}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Filter Sidebar */}
      {!isMobile && (
        <FilterSidebar
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          activeFiltersCount={activeFiltersCount}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-card border-card-border">
          <div className="flex items-center justify-between p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Filters Button */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  data-testid="button-filters-open"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-md flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-semibold text-card-foreground">DPWH Analytics Dashboard</h1>
                  <p className="text-xs md:text-sm text-muted-foreground">Department of Public Works and Highways</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-semibold text-card-foreground">DPWH</h1>
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

            <div className="flex items-center gap-1 md:gap-2">
              <Badge variant="outline" data-testid="badge-project-count" className="text-xs md:text-sm">
                <span className="hidden sm:inline">{filteredProjects.length} of {initialProjects.length} projects</span>
                <span className="sm:hidden">{filteredProjects.length}/{initialProjects.length}</span>
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            <div className="border-b border-border">
              <TabsList className="inline-flex h-10 md:h-12 items-center justify-start md:justify-center rounded-none bg-transparent p-1 text-muted-foreground overflow-x-auto whitespace-nowrap -mx-2 px-4 md:mx-4 md:mt-2">
                <TabsTrigger
                  value="analytics"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  data-testid="tab-analytics"
                >
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  data-testid="tab-table"
                >
                  <Table className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Data Table</span>
                  <span className="sm:hidden">Table</span>
                </TabsTrigger>
                {(isAuthenticated || process.env.NODE_ENV === 'development') && (
                  <TabsTrigger
                    value="admin"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    data-testid="tab-admin"
                  >
                    <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="analytics" className="h-full m-0">
                <AnalyticsDashboard projects={filteredProjects} isLoading={isLoading || isFetchingFiltered} onFilterChange={handleFilterChange} />
              </TabsContent>

              <TabsContent value="table" className="h-full m-0 p-3 md:p-6">
                <ProjectsTable projects={filteredProjects} isLoading={isLoading || isFetchingFiltered} />
              </TabsContent>

              <TabsContent value="admin" className="h-full m-0 p-3 md:p-6">
                <div className="max-w-2xl mx-auto">
                  <AdminLogin
                    isAuthenticated={isAuthenticated}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onDataUpload={onDataUpload}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    currentFileIndex={currentFileIndex}
                    totalFiles={totalFiles}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </main>

        <Footer />
      </div>
    </div>
  );
}
