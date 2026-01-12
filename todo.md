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


## Working Hours Tracking Enhancement

### Add Hours Input to Historical Service Modal
- [x] Add working hours input field to historical service modal
- [x] Allow manual input of equipment hours at time of service
- [x] Validate hours input (must be positive number)
- [x] Update equipment currentHours when service is saved
- [x] Display current hours in modal for reference


## Settings Screen

### Settings Tab Navigation
- [x] Create Settings screen component
- [x] Add Settings tab to bottom navigation
- [x] Configure icon mapping for Settings tab
- [x] Apply dark theme styling to Settings screen

### App Preferences
- [x] Add notification sound toggle
- [x] Add vibration feedback toggle
- [x] Store preferences in AsyncStorage
- [ ] Add theme toggle (Light/Dark mode)
- [ ] Add language preference option

### Notification Toggles
- [x] Add toggle for maintenance alerts
- [x] Add toggle for inventory alerts
- [x] Add toggle for critical inventory alerts
- [x] Save notification preferences
- [x] Add master notifications toggle

### Data Backup & Restore
- [x] Create backup export function (JSON format)
- [x] Add backup button with timestamp
- [x] Implement restore from JSON file
- [x] Add confirmation dialogs for restore
- [x] Show success/error messages
- [x] Display last backup date/time

### App Information
- [x] Display app version
- [x] Show app name
- [x] Display total records count (equipment, services, parts)
- [x] Add danger zone with clear all data option


## Service Tab Enhancements

### Cost Analysis Charts
- [x] Create pie chart component for cost breakdown by service type
- [x] Display total service costs
- [x] Show average cost per service
- [ ] Display cost trends over time
- [ ] Add service type filtering

### Service Timeline
- [x] Create visual timeline of all services
- [x] Show service dates and types
- [x] Display cost for each service
- [x] Add technician information
- [ ] Highlight overdue services

### Service Details Expansion
- [x] Add parts used information to each service
- [x] Display service notes in detail view
- [x] Show hours at service for reference
- [ ] Calculate time between services
- [ ] Add service completion status


## Settings Screen Optimization

### UI/UX Improvements
- [x] Reorganize settings into logical sections (Notifications, Data, About)
- [x] Add section headers with icons
- [x] Improve toggle switch styling and feedback
- [x] Add visual separators between sections
- [ ] Implement smooth animations for toggles
- [x] Add confirmation dialogs for destructive actions

### Performance & Functionality
- [x] Optimize settings loading and state management
- [x] Add loading indicators for backup/restore operations
- [x] Improve error handling and user feedback
- [ ] Add success animations for completed actions
- [x] Implement settings persistence optimization
- [ ] Add settings export/import functionality

### Information Display
- [x] Show last backup timestamp more prominently
- [x] Display app version with build number
- [x] Add total data size information
- [x] Show storage usage breakdown
- [x] Add quick stats (equipment count, services, parts)


## Fuel Stock Tracking

### Site Fuel Inventory
- [x] Add FuelStock type to track site fuel inventory
- [x] Implement fuel stock state management in useAppData
- [x] Create fuel stock persistence in AsyncStorage
- [x] Add sample fuel stock data
- [x] Create modal for adding/updating site fuel stock
- [x] Display current fuel stock on Dashboard

### Equipment Fuel Levels
- [x] Add fuel level field to Equipment type
- [ ] Track fuel consumption from fuel logs
- [ ] Calculate remaining fuel in each equipment
- [x] Display fuel levels in equipment status cards
- [x] Show fuel level indicators (full/medium/low/critical)
- [ ] Integrate with Dashboard alerts
- [ ] Update AddFuelModal to deduct from site fuel stock when adding to equipment

### Dashboard Integration
- [x] Display site fuel stock prominently
- [x] Show fuel levels for Loader (Utovarivač)
- [x] Show fuel levels for Generator
- [ ] Add fuel stock alerts (low/critical)
- [x] Create quick "Add Fuel" action for site stock
- [ ] Add fuel consumption trends


## Automatic Fuel Deduction

- [x] Update AddFuelModal to deduct from site fuel stock when adding to equipment
- [x] Validate site fuel stock has enough fuel before adding to equipment
- [x] Show error message if site fuel stock is insufficient
- [x] Update equipment fuel level when adding fuel
- [x] Update site fuel stock when adding fuel to equipment
- [x] Display confirmation message showing both updates


## Customizable PDF Reports

- [x] Create PDF report configuration modal
- [x] Add checkboxes for selecting report sections (Equipment Status, Service History, Fuel Logs, Inventory, etc.)
- [ ] Add date range selector for filtering data
- [x] Implement PDF generation with selected sections
- [x] Add company header/logo to PDF reports
- [x] Include summary statistics in PDF
- [x] Add page numbers and timestamps to PDF
- [x] Implement share/download functionality for generated PDFs


## Daily Report Form & Operational Checklists

### Daily Report Screen
- [x] Create dedicated Daily Report tab/screen
- [x] Add date selector with default to today
- [x] Add shift selector (morning/afternoon/night)
- [x] Implement equipment hours input fields for all equipment
- [x] Add notes field for general observations
- [x] Display current equipment hours for reference
- [x] Implement save functionality with validation

### Operational Checklists
- [x] Create checklist items (safety checks, equipment status, site conditions)
- [x] Add checkbox UI for each checklist item
- [x] Implement checklist completion tracking
- [ ] Add optional notes for each checklist item
- [x] Display completion status (completed/incomplete)
- [x] Save checklist results with daily report

### Daily Report History
- [ ] Display list of all saved daily reports
- [ ] Show report date, shift, and completion status
- [ ] Add search/filter by date range
- [ ] Implement view report details modal
- [ ] Add edit functionality for recent reports
- [ ] Display summary statistics (total hours logged, completion rate)

### Integration
- [ ] Update equipment hours automatically when daily report is saved
- [ ] Add daily report summary to Dashboard
- [ ] Create daily report export to CSV/PDF
- [ ] Add reminder notifications for end-of-day reporting
- [ ] Display last report date on Dashboard


## Camera Integration & Photo Attachments

### Camera Setup
- [x] Install expo-image-picker package
- [x] Request camera and media library permissions
- [x] Create photo picker component with camera and gallery options
- [x] Implement image compression for storage optimization
- [x] Add photo preview functionality

### Daily Report Photos
- [x] Add photo attachment field to DailyReport type
- [x] Create photo picker UI in Daily Report screen
- [x] Display attached photos in report
- [x] Allow multiple photo attachments per report
- [x] Implement photo deletion from reports
- [x] Store photos in AsyncStorage or file system

### Service Record Photos
- [x] Add photo attachment field to ServiceRecord type
- [x] Integrate photo picker in Record Service modal
- [x] Integrate photo picker in Historical Service modal
- [x] Display photos in service history
- [x] Show photos in equipment detail modals
- [x] Display photo count in service record lists

### Photo Management
- [ ] Implement photo storage strategy (base64 or file paths)
- [ ] Add photo viewer modal for full-screen viewing
- [ ] Implement photo deletion with confirmation
- [ ] Display photo thumbnails in lists
- [ ] Add photo count indicators


## Dashboard Redesign

### Visual Improvements
- [x] Redesign header section with app title and summary stats
- [x] Improve quick action buttons layout and styling
- [x] Redesign equipment status cards with better visual hierarchy
- [x] Enhance alerts section with improved styling
- [x] Redesign fuel stock card with visual fuel gauge
- [x] Add visual separators and sections
- [x] Improve spacing and padding throughout
- [ ] Add subtle animations and transitions

### Layout Optimization
- [x] Reorganize sections for better information flow
- [x] Optimize card sizes and proportions
- [x] Improve responsive layout for different screen sizes
- [x] Add visual indicators and icons
- [x] Enhance color usage and contrast


## Dashboard Interactivity

### Tappable Sections
- [x] Make equipment cards tappable to open Equipment Detail Modal
- [x] Make alerts tappable to navigate to relevant screens
- [ ] Add Services section with tappable service items
- [ ] Add Low Stock section with tappable inventory items
- [x] Add visual feedback on card press


## Quick Action Buttons Enhancement

### Button Improvements
- [x] Add press animations to quick action buttons
- [x] Improve button visual hierarchy
- [x] Add button descriptions/tooltips
- [ ] Add haptic feedback on button press
- [x] Improve icon visibility and sizing
- [x] Add button state indicators


## Fuel Storage Enhancement

### Add Fuel Modal Improvements
- [x] Display current fuel storage level in Add Fuel modal
- [x] Show fuel storage capacity and percentage
- [x] Display minimum level threshold
- [x] Add visual fuel gauge in modal

### Dashboard Fuel Widget
- [x] Add fuel status widget to Dashboard summary cards
- [x] Show current fuel level and capacity
- [x] Add visual indicator for low fuel
- [x] Make fuel widget tappable to open Fuel Stock modal
