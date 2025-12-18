# AZVIRT Maintenance Tracker - Mobile App Design

## Overview
A mobile application for tracking equipment maintenance, oil changes, fuel consumption, and spare parts inventory for a concrete batching plant. The app mirrors the Excel spreadsheet functionality with a focus on quick data entry, status monitoring, and maintenance scheduling.

## Design Principles
- **Mobile-first**: Portrait orientation (9:16), optimized for one-handed use
- **iOS-style**: Follows Apple Human Interface Guidelines with clean, minimal design
- **Functional**: Prioritizes quick access to critical information and data entry
- **Professional**: Suitable for field technicians and maintenance managers

## Color Palette
- **Primary**: `#007AFF` (iOS Blue) - Actions, buttons, highlights
- **Success**: `#34C759` (iOS Green) - Good status, completed tasks
- **Warning**: `#FF9500` (iOS Orange) - Maintenance due soon
- **Danger**: `#FF3B30` (iOS Red) - Overdue maintenance, critical alerts
- **Neutral**: `#8E8E93` (iOS Gray) - Secondary text, disabled states
- **Background**: `#F2F2F7` (Light Gray) - Card backgrounds
- **Surface**: `#FFFFFF` (White) - Primary surface

## Screen List

### 1. **Dashboard (Home)**
The main control center showing equipment status at a glance.

**Content:**
- Equipment status cards (Mixer, Loader, Generator)
- Each card shows: current hours, next service date, status indicator, hours until service
- Quick action buttons: "Log Hours", "Record Service", "Add Fuel"
- Alerts section: overdue maintenance, low inventory warnings
- Next scheduled lubrication date

**Functionality:**
- Tap equipment card → Equipment Detail screen
- Tap "Log Hours" → Log Hours modal
- Tap alert → Navigate to relevant detail screen

### 2. **Equipment Detail**
Detailed view for a single piece of equipment.

**Content:**
- Equipment name and status
- Current status: total hours, last service date, next service date, hours remaining
- Service history list (scrollable)
- Fuel consumption log (scrollable)
- Quick action buttons: "Log Hours", "Record Service", "Add Fuel"

**Functionality:**
- Swipe to refresh
- Tap service record → Service Detail modal
- Tap "Log Hours" → Log Hours modal
- Tap "Record Service" → Service Entry modal
- Tap "Add Fuel" → Fuel Entry modal

### 3. **Lubrication Schedule**
Track all lubrication points and their maintenance status.

**Content:**
- List of lubrication points (bearings, joints, etc.)
- Each item shows: name, frequency, last completed, next due, status
- Filter options: by equipment, by frequency
- Completion checklist for weekly/daily tasks

**Functionality:**
- Tap item → Mark as completed (with date/time)
- Tap "Complete All Weekly" → Bulk mark weekly items as done
- Pull to refresh

### 4. **Spare Parts Inventory**
Manage spare parts stock and track low inventory alerts.

**Content:**
- List of spare parts with: name, part number, equipment type, current stock, minimum level, price
- Color-coded status: green (adequate), orange (low), red (critical)
- Total inventory value
- Search/filter by equipment or part name

**Functionality:**
- Tap part → Part Detail modal (edit stock, view history)
- Tap "+" → Add new part
- Swipe to delete (with confirmation)

### 5. **Service Records**
Complete history of all maintenance work performed.

**Content:**
- Chronological list of service records
- Each record shows: date, equipment, service type, hours, technician, cost
- Filter by equipment or date range
- Total cost summary

**Functionality:**
- Tap record → Service Detail modal (view full details, edit, delete)
- Tap "+" → New Service Entry modal
- Filter by equipment

### 6. **Daily Report**
Log daily equipment usage and operational checklist.

**Content:**
- Date selector
- Equipment hours and fuel for each piece
- Daily checklist items (air pressure, filter status, etc.)
- Operator name and notes

**Functionality:**
- Auto-fill today's date
- Save draft and submit
- View past reports

### 7. **Monthly Summary**
View aggregated monthly data and key metrics.

**Content:**
- Month selector
- Equipment breakdown: hours, fuel, costs
- Total fuel consumption and cost
- Service count and total cost
- Key metrics: fuel efficiency, cost per hour

**Functionality:**
- Swipe to change month
- Export/share summary

## Key User Flows

### Flow 1: Log Equipment Hours
1. User taps "Log Hours" on Dashboard
2. Modal appears with equipment selector
3. User enters current hour reading
4. System calculates hours worked since last entry
5. User confirms and saves
6. Dashboard updates, service due dates recalculate

### Flow 2: Record Service
1. User taps "Record Service" on Equipment Detail
2. Modal appears with form:
   - Service type (dropdown)
   - Parts used (multi-select)
   - Cost
   - Technician name
   - Notes
3. User fills form and saves
4. Service record created, next service date updates
5. Equipment status refreshes

### Flow 3: Check Lubrication Status
1. User navigates to Lubrication Schedule
2. Views list of lubrication points
3. Taps "Complete All Weekly" to mark weekly items done
4. Confirmation shows: 7 items marked complete
5. Next due dates update automatically

### Flow 4: Manage Inventory
1. User navigates to Spare Parts
2. Sees red alert on "Motor Oil 15W40" (stock: 20, minimum: 20)
3. Taps part to open detail
4. Enters new stock quantity after receiving shipment
5. Part status changes to green
6. Alert clears from dashboard

## Navigation Structure

```
Dashboard (Home)
├── Equipment Detail
│   ├── Log Hours (modal)
│   ├── Record Service (modal)
│   ├── Add Fuel (modal)
│   └── Service Detail (modal)
├── Lubrication Schedule
│   └── Mark Complete (inline)
├── Spare Parts
│   ├── Part Detail (modal)
│   └── Add Part (modal)
├── Service Records
│   ├── Service Detail (modal)
│   └── New Service (modal)
├── Daily Report
│   └── View/Edit Report (modal)
└── Monthly Summary
    └── View Details (modal)
```

## Tab Bar Navigation
- **Home** (Dashboard)
- **Equipment** (Equipment list/detail)
- **Maintenance** (Lubrication schedule + service records combined)
- **Inventory** (Spare parts)
- **Reports** (Daily/Monthly summaries)

## Data Entry Patterns

### Quick Entry (Modal)
- Log Hours: equipment, hours, notes
- Add Fuel: equipment, liters, cost, notes
- Mark Lubrication: point, completion checkbox

### Detailed Entry (Full Screen)
- Service Record: type, parts, cost, technician, notes
- New Part: name, part number, equipment, stock, minimum, price
- Daily Report: date, equipment data, checklist items

## Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| **Good** | Green (#34C759) | Service not due, adequate stock |
| **Warning** | Orange (#FF9500) | Service due within 1 week or 50 hours |
| **Overdue** | Red (#FF3B30) | Service overdue or stock critical |
| **Pending** | Blue (#007AFF) | Awaiting action/confirmation |

## Typography
- **Title**: 32pt, bold, primary text
- **Subtitle**: 20pt, bold, primary text
- **Body**: 16pt, regular, primary text
- **Caption**: 12pt, regular, secondary text
- **Monospace**: 14pt, for hours/numbers

## Spacing & Layout
- Safe area padding: 16pt minimum
- Card padding: 12pt
- Section spacing: 16pt
- Touch target minimum: 44pt
- Border radius: 12pt for cards, 8pt for buttons

## Accessibility
- Minimum contrast ratio: 4.5:1 for text
- All interactive elements labeled
- Dark mode support
- Haptic feedback on critical actions
