import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/not-found";
import UrlParamsTest from "@/pages/url-params-test";
import UrlDebug from "@/pages/url-debug";
import { useState } from "react";

// todo: remove mock data - this will be replaced with real API calls
const mockProjects = [
  {
    contractId: "25HN0043",
    contractName: "OO2: PROTECT LIVES AND PROPERTIES AGAINST MAJOR FLOODS-FLOOD MANAGEMENT PROGRAM-CONST./ MAINT. OF FLOOD MITIGATION STRUCTURES AND DRAINAGE SYS.- CONST. OF FLOOD CONTROL STRUCTURE ALONG BUTUANON RIVER (DOWNSTREAM) OUTFALL, BRGY. PAKNA-AN, MANDAUE CITY",
    contractor: "ON POINT CONSTRUCTION AND DEVELOPMENT CORPORATION (FORMERLY:ON POINT CONSTRUCTION) (38852)",
    implementingOffice: "Cebu 6th District Engineering Office",
    contractCost: 72325000,
    contractEffectivityDate: "February 21, 2025",
    contractExpiryDate: "November 2, 2025",
    status: "Completed",
    accomplishmentInPercentage: 100,
    region: "Region VII",
    sourceOfFundsDesc: "Regular Infra",
    sourceOfFundsYear: "GAA 2025",
    sourceOfFundsSource: "OO-2",
    year: "2025",
    province: "Region VII (Central Visayas)",
    municipality: "City of Mandaue",
    barangay: "Pakna-an"
  },
  {
    contractId: "24HN0032",
    contractName: "ROAD IMPROVEMENT PROJECT ALONG NATIONAL HIGHWAY - PHASE 1 IMPLEMENTATION WITH ADDITIONAL SAFETY MEASURES",
    contractor: "ABC Construction Company (12345)",
    implementingOffice: "Manila District Engineering Office",
    contractCost: 150000000,
    contractEffectivityDate: "January 15, 2024",
    contractExpiryDate: "December 15, 2024",
    status: "On-going",
    accomplishmentInPercentage: 75,
    region: "Region IV-A",
    sourceOfFundsDesc: "Regular Infra",
    sourceOfFundsYear: "GAA 2024",
    sourceOfFundsSource: "OO-1",
    year: "2024",
    province: "Metro Manila",
    municipality: "Manila City",
    barangay: "Ermita"
  },
  {
    contractId: "23HN0021",
    contractName: "BRIDGE CONSTRUCTION PROJECT OVER PASIG RIVER - MODERN SUSPENSION BRIDGE WITH PEDESTRIAN WALKWAYS",
    contractor: "XYZ Engineering Services Corporation (67890)",
    implementingOffice: "Metro Manila Engineering Office",
    contractCost: 250000000,
    contractEffectivityDate: "March 10, 2023",
    contractExpiryDate: "March 10, 2025",
    status: "On-going",
    accomplishmentInPercentage: 60,
    region: "NCR",
    sourceOfFundsDesc: "Bridge Program",
    sourceOfFundsYear: "GAA 2023",
    sourceOfFundsSource: "BP-1",
    year: "2023",
    province: "Metro Manila",
    municipality: "Pasig City",
    barangay: "Kapitolyo"
  },
  {
    contractId: "24HN0055",
    contractName: "DRAINAGE SYSTEM IMPROVEMENT IN URBAN AREAS - SMART FLOOD CONTROL SYSTEM WITH IoT MONITORING",
    contractor: "DEF Infrastructure Corporation (11111)",
    implementingOffice: "Cebu 6th District Engineering Office",
    contractCost: 89000000,
    contractEffectivityDate: "June 1, 2024",
    contractExpiryDate: "May 31, 2025",
    status: "Completed",
    accomplishmentInPercentage: 100,
    region: "Region VII",
    sourceOfFundsDesc: "Drainage Program",
    sourceOfFundsYear: "GAA 2024",
    sourceOfFundsSource: "DP-1",
    year: "2024",
    province: "Cebu",
    municipality: "Cebu City",
    barangay: "Lahug"
  },
  {
    contractId: "22HN0018",
    contractName: "COASTAL ROAD DEVELOPMENT PROJECT - PHASE 2 WITH ENVIRONMENTAL PROTECTION MEASURES",
    contractor: "GHI Construction Limited (22222)",
    implementingOffice: "Davao District Engineering Office",
    contractCost: 180000000,
    contractEffectivityDate: "August 15, 2022",
    contractExpiryDate: "August 15, 2024",
    status: "Completed",
    accomplishmentInPercentage: 100,
    region: "Region XI",
    sourceOfFundsDesc: "Tourism Infrastructure",
    sourceOfFundsYear: "GAA 2022",
    sourceOfFundsSource: "TI-1",
    year: "2022",
    province: "Davao del Sur",
    municipality: "Davao City",
    barangay: "Poblacion"
  },
  {
    contractId: "23HN0067",
    contractName: "SCHOOL BUILDING CONSTRUCTION PROJECT - ELEMENTARY SCHOOL WITH MODERN FACILITIES",
    contractor: "JKL Educational Builders Inc (33333)",
    implementingOffice: "Iloilo District Engineering Office",
    contractCost: 45000000,
    contractEffectivityDate: "September 1, 2023",
    contractExpiryDate: "August 31, 2024",
    status: "On-going",
    accomplishmentInPercentage: 85,
    region: "Region VI",
    sourceOfFundsDesc: "Education Infrastructure",
    sourceOfFundsYear: "GAA 2023",
    sourceOfFundsSource: "EI-1",
    year: "2023",
    province: "Iloilo",
    municipality: "Iloilo City",
    barangay: "Molo"
  },
  {
    contractId: "21HN0003",
    contractName: "WATER SUPPLY SYSTEM IMPROVEMENT - RURAL WATER DISTRIBUTION NETWORK EXPANSION",
    contractor: "MNO Water Solutions Corp (44444)",
    implementingOffice: "Baguio District Engineering Office",
    contractCost: 95000000,
    contractEffectivityDate: "April 12, 2021",
    contractExpiryDate: "April 12, 2023",
    status: "Completed",
    accomplishmentInPercentage: 100,
    region: "CAR",
    sourceOfFundsDesc: "Water Infrastructure",
    sourceOfFundsYear: "GAA 2021",
    sourceOfFundsSource: "WI-1",
    year: "2021",
    province: "Benguet",
    municipality: "Baguio City",
    barangay: "Session Road"
  },
  {
    contractId: "24HN0089",
    contractName: "AIRPORT RUNWAY REHABILITATION PROJECT - PHASE 1 WITH MODERN LIGHTING SYSTEMS",
    contractor: "PQR Aviation Infrastructure Ltd (55555)",
    implementingOffice: "Zamboanga District Engineering Office",
    contractCost: 320000000,
    contractEffectivityDate: "November 5, 2024",
    contractExpiryDate: "November 5, 2026",
    status: "On-going",
    accomplishmentInPercentage: 25,
    region: "Region IX",
    sourceOfFundsDesc: "Transportation Infrastructure",
    sourceOfFundsYear: "GAA 2024",
    sourceOfFundsSource: "TI-2",
    year: "2024",
    province: "Zamboanga del Sur",
    municipality: "Zamboanga City",
    barangay: "Ayala"
  },
  {
    contractId: "23HN0012",
    contractName: "HIGHWAY EXPANSION PROJECT - 4-LANE CONVERSION WITH SAFETY BARRIERS",
    contractor: "STU Highway Contractors (66666)",
    implementingOffice: "Batangas District Engineering Office",
    contractCost: 210000000,
    contractEffectivityDate: "February 20, 2023",
    contractExpiryDate: "February 20, 2025",
    status: "On-going",
    accomplishmentInPercentage: 70,
    region: "Region IV-A",
    sourceOfFundsDesc: "Highway Program",
    sourceOfFundsYear: "GAA 2023",
    sourceOfFundsSource: "HP-1",
    year: "2023",
    province: "Batangas",
    municipality: "Batangas City",
    barangay: "Kumintang"
  },
  {
    contractId: "22HN0045",
    contractName: "GOVERNMENT BUILDING CONSTRUCTION - MUNICIPAL HALL WITH MODERN FACILITIES",
    contractor: "VWX Government Builders Corp (77777)",
    implementingOffice: "Cagayan District Engineering Office",
    contractCost: 85000000,
    contractEffectivityDate: "July 10, 2022",
    contractExpiryDate: "July 10, 2024",
    status: "Completed",
    accomplishmentInPercentage: 100,
    region: "Region II",
    sourceOfFundsDesc: "Government Infrastructure",
    sourceOfFundsYear: "GAA 2022",
    sourceOfFundsSource: "GI-1",
    year: "2022",
    province: "Cagayan",
    municipality: "Tuguegarao City",
    barangay: "Centro"
  }
];

function DashboardPage() {
  // todo: remove mock functionality
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogin = () => {
    console.log('Admin login triggered');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Admin logout triggered');
    setIsAuthenticated(false);
  };

  const handleDataUpload = async (files: FileList) => {
    console.log('Data upload triggered with files:', files);
    setIsUploading(true);
    
    // todo: remove mock functionality - simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    alert(`Successfully processed ${files.length} file(s) with ${mockProjects.length} total projects`);
  };

  return (
    <DashboardLayout
      projects={mockProjects}
      isLoading={false}
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onDataUpload={handleDataUpload}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/test-url-params" component={UrlParamsTest} />
      <Route path="/url-debug*" component={UrlDebug} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
