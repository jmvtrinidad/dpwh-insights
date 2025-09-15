# DPWH Analytics Dashboard Design Guidelines

## Design Approach
**System-Based Approach**: Following government dashboard conventions with influences from USA's Federal Spending Tracker and Philippines' Budget Partnership platform. Prioritizing clarity, accessibility, and professional government aesthetic over visual flair.

## Color Palette
**Primary Colors:**
- Government Blue: 207 100% 40% (#0066CC) - Primary actions, headers
- Philippine Green: 120 61% 34% (#228B22) - Success states, completed projects
- Light Background: 210 14% 97% (#F8F9FA) - Main background
- Dark Text: 210 11% 15% (#212529) - Primary text

**Status & Utility Colors:**
- Success Green: 134 61% 41% (#28A745) - Completed projects
- Warning Amber: 45 100% 51% (#FFC107) - Ongoing projects
- Muted Grey: 210 9% 46% (#6C757D) - Secondary text, borders

**Dark Mode:**
- Dark Background: 210 11% 15% (#212529)
- Dark Cards: 210 9% 23% (#343A40)
- Light Text: 0 0% 95% (#F8F9FA)

## Typography
- **Primary**: Inter (via Google Fonts CDN)
- **Fallback**: Roboto, system fonts
- **Hierarchy**: Large titles (2xl), section headers (xl), body text (base), captions (sm)
- **Weights**: Regular (400) for body, Medium (500) for labels, Semibold (600) for headings

## Layout System
**Spacing Units**: Consistent use of Tailwind units 2, 4, 8, 16 (p-2, m-4, gap-8, mb-16)
- Tight spacing: 2-4 units for related elements
- Standard spacing: 8 units for component separation
- Section spacing: 16 units for major layout sections

## Component Library

### Core Layout
- **Sidebar**: Fixed 280px width with collapsible mobile drawer
- **Main Content**: Responsive grid with card-based sections
- **Header**: 64px height with admin auth controls

### Navigation & Filters
- **Filter Sidebar**: Grouped accordion-style filters with clear labels
- **Tab Navigation**: Underline style for Analytics/Table views
- **Breadcrumbs**: Hierarchical navigation for deep filtering

### Data Visualization
- **Chart Cards**: White/dark cards with subtle shadows, 8px radius
- **Bar Charts**: Government blue with hover states
- **Legends**: Positioned below charts with color indicators

### Data Display
- **Data Table**: Striped rows, sortable headers, pagination controls
- **Status Badges**: Rounded pills with appropriate status colors
- **Metrics Cards**: Large numbers with descriptive labels

### Forms & Admin
- **Login Form**: Centered modal with Replit Auth integration
- **Upload Interface**: Drag-and-drop zone with JSON validation feedback
- **Admin Actions**: Prominent but secured behind authentication

## Interactions
- **Hover States**: Subtle elevation and color changes
- **Loading States**: Skeleton loaders for data-heavy sections
- **Animations**: Minimal - only smooth transitions (200ms ease)
- **Responsive**: Mobile-first with sidebar collapse

## Accessibility
- High contrast ratios meeting WCAG AA standards
- Keyboard navigation for all interactive elements
- Screen reader labels for chart data
- Focus indicators on all clickable elements

## Key Design Principles
1. **Data Clarity**: Information hierarchy prioritizes key metrics
2. **Government Professional**: Trustworthy, official appearance
3. **Performance**: Fast loading with efficient data presentation
4. **Consistency**: Uniform spacing, colors, and component behavior
5. **Accessibility**: Inclusive design for all government users

This dashboard emphasizes functional excellence over visual novelty, ensuring government users can efficiently analyze DPWH project data with confidence and clarity.