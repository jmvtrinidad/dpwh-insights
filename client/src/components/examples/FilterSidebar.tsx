import FilterSidebar from '../FilterSidebar';
import { useState } from 'react';

export default function FilterSidebarExample() {
  // todo: remove mock functionality
  const [filters, setFilters] = useState({
    region: '__all__',
    implementingOffice: '__all__',
    contractor: '__all__',
    status: '__all__',
    year: '__all__',
    province: '__all__',
    municipality: '__all__',
    barangay: '__all__'
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  // todo: remove mock data
  const mockOptions = {
    regions: ['Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI'],
    implementingOffices: [
      'Cebu 6th District Engineering Office',
      'Manila District Engineering Office',
      'Davao District Engineering Office'
    ],
    contractors: [
      'ON POINT CONSTRUCTION AND DEVELOPMENT CORPORATION',
      'ABC Construction Company',
      'XYZ Engineering Services'
    ],
    statuses: ['Completed', 'On-going', 'Suspended', 'Cancelled'],
    years: ['2025', '2024', '2023', '2022', '2021', '2020'],
    provinces: ['Region VII (Central Visayas)', 'Cebu', 'Bohol'],
    municipalities: ['City of Mandaue', 'Cebu City', 'Lapu-Lapu City'],
    barangays: ['Pakna-an', 'Lahug', 'Banilad']
  };

  const handleFilterChange = (key: string, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
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
    <div className="h-screen">
      <FilterSidebar
        filters={filters}
        options={mockOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
    </div>
  );
}