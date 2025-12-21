# AZVIRT Maintenance Tracker - Development TODO

## Core Features

### Data Models & Storage
- [x] Create TypeScript types for Equipment, Service, FuelLog, LubricationPoint, SparePart
- [x] Implement AsyncStorage schema for local data persistence
- [x] Create data initialization with sample equipment (Mixer, Loader, Generator)

### Dashboard Screen
- [x] Build equipment status cards (3-column layout)
- [x] Implement status indicator logic (green/orange/red)
- [x] Add alerts section (overdue maintenance, low inventory)
- [ ] Create quick action buttons (Log Hours, Record Service, Add Fuel)
- [x] Implement pull-to-refresh functionality

### Equipment Detail Screen
- [x] Build equipment detail view with status summary
- [x] Create service history list with date/type/cost
- [x] Add fuel consumption log
- [ ] Implement "Log Hours" modal
- [ ] Implement "Record Service" modal
- [ ] Implement "Add Fuel" modal

### Lubrication Schedule Screen
- [x] Build lubrication points list
- [x] Implement frequency filtering (daily/weekly/monthly)
- [x] Create completion checklist with date tracking
- [ ] Add "Complete All Weekly" bulk action
- [x] Implement status indicators for each point

### Spare Parts Inventory Screen
- [x] Build parts list with stock status indicators
- [x] Implement color-coded alerts (green/orange/red)
- [ ] Add search/filter functionality
- [x] Create Part Detail modal (view/edit stock)
- [ ] Implement "Add Part" modal
- [x] Display total inventory value

### Service Records Screen
- [x] Build chronological service history list
- [ ] Add equipment filter
- [ ] Create Service Detail modal
- [ ] Implement "New Service" modal
- [x] Add cost summary display

### Daily Report Screen
- [ ] Build daily report form
- [ ] Implement equipment hours input fields
- [ ] Create operational checklist items
- [ ] Add date selector
- [ ] Implement save/submit functionality

### Monthly Summary Screen
- [x] Build month selector
- [x] Display equipment breakdown (hours, fuel, costs)
- [x] Calculate key metrics (fuel efficiency, cost per hour)
- [x] Add total cost summary

### Navigation & Tabs
- [x] Configure 5-tab bottom navigation (Home, Equipment, Maintenance, Inventory, Reports)
- [x] Add icon mappings for all tabs
- [x] Implement tab bar styling and colors
- [x] Set up screen transitions

### Theme & Styling
- [x] Update color palette in theme.ts (iOS blue, green, orange, red)
- [x] Configure typography (title, subtitle, body, caption)
- [x] Set up spacing constants (8pt grid)
- [x] Implement dark mode support

### Branding
- [x] Generate custom app logo/icon
- [x] Update app.config.ts with app name and logo URL
- [x] Create splash screen assets

## Data Management

### AsyncStorage Integration
- [ ] Create storage utility functions (save, load, delete)
- [ ] Implement data migration/backup
- [ ] Add error handling for storage operations

### Data Calculations
- [ ] Calculate hours until next service
- [ ] Calculate days until next maintenance
- [ ] Determine status based on thresholds
- [ ] Aggregate monthly costs and fuel consumption

## UI Components

### Reusable Components
- [ ] EquipmentCard (status display)
- [ ] StatusBadge (color-coded status indicator)
- [ ] AlertCard (warning/alert display)
- [ ] ListItem (generic list item with icon/title/subtitle)
- [ ] ActionButton (primary/secondary buttons)
- [ ] Modal wrapper (consistent modal styling)
- [ ] FormInput (text input with validation)
- [ ] FormSelect (dropdown selector)

## Testing & Polish

### Functionality Testing
- [ ] Test equipment hours logging
- [ ] Test service record creation and updates
- [ ] Test inventory stock updates
- [ ] Test lubrication completion tracking
- [ ] Test data persistence across app restarts
- [ ] Test alert generation and clearing

### UI/UX Testing
- [ ] Test responsive layout on various screen sizes
- [ ] Test dark mode appearance
- [ ] Test touch targets (minimum 44pt)
- [ ] Test safe area handling (notch, home indicator)
- [ ] Test navigation flows (no dead ends)

### Performance
- [ ] Optimize list rendering (FlatList)
- [ ] Minimize re-renders with memoization
- [ ] Test with large datasets (100+ records)

## Documentation
- [ ] Add inline code comments
- [ ] Create user guide for data entry
- [ ] Document storage schema

## Deployment Preparation
- [ ] Create initial checkpoint
- [ ] Verify all features working end-to-end
- [ ] Test on actual device/simulator
- [ ] Prepare for publishing


## Export Functionality

### CSV Export
- [x] Create CSV export utility for service records
- [x] Create CSV export utility for monthly reports
- [x] Create CSV export utility for inventory
- [x] Implement file sharing/download mechanism
- [x] Add export button to Reports screen

### PDF Export
- [x] Create PDF export utility for monthly reports
- [x] Create PDF export utility for service history
- [x] Format PDF with headers, tables, and summaries
- [x] Implement file sharing/download mechanism
- [x] Add export button to Reports screen

### File Management
- [x] Handle file permissions for document export
- [x] Implement file naming with timestamps
- [x] Add success/error notifications for exports


## Quick Data Entry Modals

### Log Hours Modal
- [x] Create modal component for logging equipment hours
- [x] Implement equipment selector dropdown
- [x] Add hours input field with validation
- [x] Add optional notes field
- [x] Implement save functionality
- [x] Add modal to Dashboard screen

### Record Service Modal
- [x] Create modal component for recording service
- [x] Implement equipment selector
- [x] Add service type dropdown
- [x] Add parts used multi-select
- [x] Add cost input field
- [x] Add technician name field
- [x] Add notes field
- [x] Implement save functionality
- [x] Add modal to Dashboard and Equipment screens

### Add Fuel Modal
- [x] Create modal component for adding fuel
- [x] Implement equipment selector
- [x] Add liters input field
- [x] Add cost per liter field
- [x] Add optional notes field
- [x] Implement save functionality
- [x] Add modal to Dashboard and Equipment screens

### Modal Integration
- [x] Create modal state management hook
- [x] Add modal overlay/backdrop
- [x] Implement form validation
- [x] Add success notifications
- [x] Add error handling


## Bulk Lubrication Actions

### Complete All Weekly Feature
- [x] Create "Complete All Weekly" button in Maintenance screen
- [x] Implement bulk completion logic for weekly lubrication points
- [x] Add confirmation dialog before marking all as complete
- [x] Update next due dates for all weekly points
- [x] Display success notification with count of completed items
- [x] Add visual feedback/animation for bulk action


## Design & Branding Updates

### Background Image Implementation
- [x] Copy background image to assets
- [x] Create background image component
- [x] Apply background to all screens
- [x] Adjust opacity for readability
- [ ] Implement parallax effect on scroll

### Color Scheme Update
- [x] Update primary color to orange (#FF9500)
- [x] Update secondary color to blue (#0066CC)
- [x] Update accent colors to match construction theme
- [x] Update status colors (green, orange, red remain)
- [x] Update text colors for contrast over background

### Visual Design Improvements
- [x] Add construction/industrial styling to cards
- [x] Update button styles with orange theme
- [ ] Add safety/industrial icons
- [x] Improve typography hierarchy
- [x] Add visual depth with shadows and borders


## Search & Filtering

### Inventory Search
- [x] Add search bar component to Inventory screen
- [x] Implement search by part name and SKU
- [x] Add real-time filtering as user types
- [x] Display search results count
- [x] Add clear search button

### Service Records Search
- [x] Add search bar component to Service Records tab
- [x] Implement search by service type and equipment
- [ ] Add date range filtering
- [x] Display search results count
- [x] Add clear search button

## Local Notifications

### Notification Setup
- [x] Configure expo-notifications package
- [x] Request notification permissions
- [x] Create notification handler functions

### Maintenance Alerts
- [x] Schedule notifications for overdue maintenance
- [x] Notify when equipment hours approach service interval
- [x] Notify when lubrication points are overdue

### Inventory Alerts
- [x] Schedule notifications when spare parts reach critical stock level
- [x] Schedule notifications when spare parts reach low stock level
- [ ] Allow users to dismiss or snooze notifications


## Equipment Detail Modals & Charts

### Equipment Detail Modal
- [x] Create equipment detail modal component
- [x] Display equipment status and current hours
- [x] Show next service date and hours until service
- [x] Display fuel consumption summary
- [x] Show recent service records (last 5)
- [x] Add close button and navigation

### Fuel Consumption Charts
- [x] Create fuel consumption line chart component
- [x] Display monthly fuel consumption trends
- [x] Calculate fuel efficiency (hours per liter)
- [x] Show cost per hour metrics
- [ ] Add date range selector for chart

### Service History in Modal
- [x] Display full chronological service history
- [x] Show service type, date, cost, and technician
- [ ] Add parts used information
- [x] Calculate total maintenance costs
- [ ] Add service record filtering by type


## Dark Theme Redesign

### Color Palette Updates
- [x] Update dark mode background colors (darker grays/blacks)
- [x] Update dark mode text colors (lighter for contrast)
- [x] Update card backgrounds for dark theme
- [x] Update overlay colors for dark theme
- [x] Keep orange (#FF9500) and blue accent colors
- [x] Update status colors for dark theme visibility

### Component Updates
- [x] Update ThemedText colors for dark mode
- [x] Update ThemedView backgrounds for dark mode
- [x] Update button styles for dark theme
- [x] Update modal backgrounds for dark theme
- [x] Update search bar styling for dark theme
- [x] Update chart colors for dark theme visibility

### Screen Updates
- [x] Update Dashboard dark theme
- [x] Update Equipment screen dark theme
- [x] Update Maintenance screen dark theme
- [x] Update Inventory screen dark theme
- [x] Update Reports screen dark theme
- [x] Update all modals for dark theme


## Historical Service Tracking

### Add Historical Services Modal
- [x] Create modal component for adding past services/oil changes
- [x] Implement date picker for service date selection
- [x] Add service type dropdown (Oil Change, Filter, etc.)
- [x] Add equipment selector
- [x] Add cost input field
- [x] Add technician name field
- [x] Add notes field
- [x] Implement save functionality
- [x] Add modal to Dashboard and Equipment screens

### Historical Data Import
- [x] Allow bulk import of past services
- [x] Display confirmation before saving
- [x] Show success notification with count of added services
- [x] Update equipment service history immediately

### Service History Display
- [x] Display all services (past and new) in chronological order
- [x] Show service date prominently
- [ ] Indicate which services are historical vs. recent
- [ ] Allow filtering by date range
- [x] Calculate total maintenance costs from all services
