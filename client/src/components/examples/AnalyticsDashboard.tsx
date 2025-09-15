import AnalyticsDashboard from '../AnalyticsDashboard';

export default function AnalyticsDashboardExample() {
  // todo: remove mock data
  const mockProjects = [
    {
      contractId: "25HN0043",
      contractName: "PROTECT LIVES AND PROPERTIES AGAINST MAJOR FLOODS-FLOOD MANAGEMENT PROGRAM-CONST./ MAINT. OF FLOOD MITIGATION STRUCTURES",
      contractor: "ON POINT CONSTRUCTION AND DEVELOPMENT CORPORATION",
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
      contractName: "ROAD IMPROVEMENT PROJECT ALONG NATIONAL HIGHWAY",
      contractor: "ABC Construction Company",
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
      contractName: "BRIDGE CONSTRUCTION PROJECT OVER PASIG RIVER",
      contractor: "XYZ Engineering Services",
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
      contractName: "DRAINAGE SYSTEM IMPROVEMENT IN URBAN AREAS",
      contractor: "DEF Infrastructure Corp",
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
      contractName: "COASTAL ROAD DEVELOPMENT PROJECT",
      contractor: "GHI Construction Ltd",
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
    }
  ];

  return <AnalyticsDashboard projects={mockProjects} />;
}