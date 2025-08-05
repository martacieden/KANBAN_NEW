# Drag'n'Drop Status Selection Feature

## Overview

This feature implements a status selection popup that appears when dragging tasks between different groups (swimlanes) in the Kanban board. Since each group is an aggregated state that can contain multiple statuses, the popup allows users to choose the specific status when moving a task.

## Implementation Details

### Components

1. **StatusSelectionPopup** (`components/StatusSelectionPopup.tsx`)
   - Modal dialog for status selection
   - Shows available statuses for the target group
   - Handles ESC key and click outside to cancel
   - Auto-selects status if only one available

2. **KanbanBoard** (`components/KanbanBoard.tsx`)
   - Modified drag and drop logic
   - Added status selection popup state management
   - Enhanced workflow validation

### Key Features

#### ✅ Status Selection Popup
- Appears when dragging between different groups
- Shows list of available statuses in target group
- Filters statuses based on workflow transitions
- Auto-selects if only one status available

#### ✅ UX Features
- **ESC key**: Closes popup and cancels action
- **Click outside**: Closes popup and cancels action
- **Cancel button**: Returns task to original position
- **Confirm button**: Moves task to selected status

#### ✅ Workflow Validation
- Validates transitions before showing popup
- Only shows valid statuses based on workflow rules
- Prevents invalid moves

#### ✅ Special Cases
- **Single status groups**: No popup, direct move
- **All tasks view**: Always shows popup for different statuses
- **Same group moves**: No popup needed

### Workflow Transitions

The system supports these group transitions:
- **CREATED** → **ACTIVE**, **PAUSED**, **REJECTED**
- **ACTIVE** → **PAUSED**, **COMPLETED**, **REJECTED**
- **PAUSED** → **CREATED**, **ACTIVE**, **REJECTED**
- **COMPLETED** → **REJECTED**
- **REJECTED** → **CREATED**, **ACTIVE**

### Status Groups

- **CREATED**: Draft, Backlog, To Do, New
- **ACTIVE**: In Progress, Working, Ongoing, Doing, Assigned
- **PAUSED**: Blocked, Needs Input, Needs Work, On Hold
- **COMPLETED**: Done, Approved, Validated
- **REJECTED**: Rejected, Canceled, Closed

## Usage Examples

### Example 1: Moving from Created to Active
1. Drag task from "Draft" (CREATED) to "In Progress" (ACTIVE)
2. Popup shows: "In Progress", "Working", "Ongoing", "Doing", "Assigned"
3. User selects "Working"
4. Task moves to "Working" status

### Example 2: All Tasks View
1. In "All tasks" view, drag task from "Draft" to "Done"
2. Popup shows: "Done", "Approved", "Validated"
3. User selects "Approved"
4. Task moves to "Approved" status

### Example 3: Single Status Group
1. Drag task to "Rejected" group
2. No popup (only one status available)
3. Task moves directly to "Rejected"

## Technical Implementation

### State Management
```typescript
const [statusSelectionPopup, setStatusSelectionPopup] = useState<{
  isOpen: boolean;
  task: any;
  fromStatus: string;
  toStatus: string;
  availableStatuses: any[];
}>({
  isOpen: false,
  task: null,
  fromStatus: '',
  toStatus: '',
  availableStatuses: []
});
```

### Key Functions
- `shouldShowStatusSelection()`: Determines if popup should appear
- `getAvailableStatusesForGroup()`: Gets statuses for a group
- `handleStatusSelectionConfirm()`: Handles status selection
- `handleStatusSelectionClose()`: Handles popup cancellation

### Integration Points
- Modified `onDragEnd()` to check for status selection
- Added popup component to render tree
- Enhanced workflow validation logic

## Testing Scenarios

1. **Basic functionality**: Drag between different groups
2. **All tasks view**: Test with "All tasks" category
3. **Single status**: Test with groups having only one status
4. **Workflow validation**: Test invalid transitions
5. **Keyboard navigation**: Test ESC key functionality
6. **Cancel behavior**: Test task returns to original position

## Future Enhancements

- **Keyboard navigation**: Arrow keys for status selection
- **Search/filter**: For groups with many statuses
- **Recent selections**: Remember user preferences
- **Bulk operations**: Handle multiple task moves
- **Custom workflows**: Allow custom transition rules 