# Category Sync Implementation

## Overview

This implementation synchronizes tasks from the "All Tasks" view into respective category views by filtering tasks based on their category and status, ensuring that each category view becomes a subset of the main "All Tasks" view.

## Key Principles

### 1. **Data Reuse**
- **No regeneration**: Tasks are not regenerated or fetched from raw sources
- **Filter from All Tasks**: All category views filter from the existing task list
- **Maintain consistency**: Same task objects, same IDs, same relationships

### 2. **Category Filtering**
```typescript
// Filter tasks for this category from All Tasks view
const categoryTasks = useMemo(() => {
  return tasks.filter(task => task.category === category);
}, [tasks, category]);
```

### 3. **Status Mapping**
Each category maps its workflow statuses to the actual statuses used in "All Tasks":

#### Budget Category
- `planning` → `["to_do", "draft", "backlog", "new"]`
- `review` → `["in_progress", "in_review", "working", "ongoing", "doing", "assigned"]`
- `approved` → `["approved", "validated", "done", "completed"]`
- `rejected` → `["rejected", "canceled", "closed", "declined", "terminated"]`

#### Legal Category
- `draft` → `["draft", "backlog", "new"]`
- `review` → `["in_progress", "in_review", "working", "ongoing", "doing", "assigned"]`
- `pending` → `["in_progress", "working", "ongoing", "doing", "assigned"]`
- `finalized` → `["approved", "validated", "done", "completed"]`

#### HR Category
- `open` → `["to_do", "new", "requested"]`
- `screening` → `["in_progress", "working", "assigned"]`
- `interviewing` → `["in_review", "ongoing", "doing"]`
- `hired` → `["approved", "done", "completed"]`

## Implementation Details

### Task Filtering Logic

```typescript
const getColumnTasks = (status: string) => {
  // Map category-specific statuses to All Tasks statuses
  const statusMapping: Record<string, string[]> = {
    "planning": ["to_do", "draft", "backlog", "new"],
    "review": ["in_progress", "in_review", "working", "ongoing", "doing", "assigned"],
    // ... more mappings
  };

  const allowedStatuses = statusMapping[status] || [status];
  
  // Get parent tasks that match the status
  const parentTasks = categoryTasks.filter(task => allowedStatuses.includes(task.status));
  
  // Get subtasks that match the status and belong to this category
  const subtasks: any[] = [];
  categoryTasks.forEach(parentTask => {
    if (parentTask.subtasks) {
      parentTask.subtasks.forEach((subtask: any) => {
        if (subtask.category === category && allowedStatuses.includes(subtask.status)) {
          // Check if parent task is also in the same column
          const parentTaskInSameColumn = parentTasks.some(pt => pt.id === parentTask.id);
          
          // Only show subtask as separate item if parent is NOT in the same column
          if (!parentTaskInSameColumn) {
            subtasks.push({
              ...subtask,
              parentTask: {
                id: parentTask.id,
                title: parentTask.title,
                category: parentTask.category,
                status: parentTask.status
              },
              isSubtask: true
            });
          }
        }
      });
    }
  });
  
  return [...parentTasks, ...subtasks];
};
```

### Subtask Display Rules

1. **Parent tasks** are displayed as main cards
2. **Subtasks** are shown below parent tasks with indentation
3. **Standalone subtasks** appear as separate cards if:
   - Parent task is not in the same column
   - Subtask belongs to the current category
   - Subtask status matches the column status

### Drag & Drop Logic

```typescript
// Map category statuses to All Tasks statuses for validation
const statusMapping: Record<string, string[]> = {
  "planning": ["to_do", "draft", "backlog", "new"],
  "review": ["in_progress", "in_review", "working", "ongoing", "doing", "assigned"],
  // ... more mappings
};

// Get the actual All Tasks statuses for the task
const currentTask = categoryTasks.find(t => t.id === draggableId);
if (!currentTask) return;

// Map the target category status to appropriate All Tasks status
const targetAllTasksStatus = statusMapping[toStatus]?.[0] || toStatus;

// Update task status
if (currentTask && onTaskUpdate) {
  onTaskUpdate(taskId, { status: targetAllTasksStatus });
  toast.success(`Task moved to ${toStatus}`);
}
```

## Benefits

### 1. **Data Consistency**
- Same task objects across all views
- No duplicate data or inconsistencies
- Real-time synchronization

### 2. **Performance**
- No additional data fetching
- Efficient filtering from existing data
- Memoized computations

### 3. **User Experience**
- Familiar task IDs and relationships
- Consistent behavior across views
- Predictable task movement

### 4. **Maintainability**
- Single source of truth
- Easier debugging and testing
- Reduced complexity

## Example Workflow

### Starting State (All Tasks)
```
To Do: [BGT-001, INV-002, HR-003]
In Progress: [PHL-005, LGL-008]
Done: [ACC-004]
```

### Budget Category View
```
Planning: [BGT-001] (maps to "to_do")
Review: [] (no Budget tasks in "in_progress")
Approved: [] (no Budget tasks in "done")
```

### Legal Category View
```
Draft: [LGL-008] (maps to "in_progress")
Review: []
Pending: []
Finalized: []
```

## Status Mapping Strategy

### Conservative Mapping
- Maps multiple All Tasks statuses to single category status
- Ensures no tasks are lost in translation
- Maintains workflow flexibility

### Example: Budget "Planning" Column
```typescript
"planning": ["to_do", "draft", "backlog", "new"]
```
This means any task with status `to_do`, `draft`, `backlog`, or `new` will appear in the Budget "Planning" column.

### Example: Budget "Review" Column
```typescript
"review": ["in_progress", "in_review", "working", "ongoing", "doing", "assigned"]
```
This means any task with status `in_progress`, `in_review`, `working`, `ongoing`, `doing`, or `assigned` will appear in the Budget "Review" column.

## Future Enhancements

### 1. **Dynamic Status Mapping**
- Allow users to customize status mappings
- Save mappings per category
- Import/export mapping configurations

### 2. **Advanced Filtering**
- Filter by assignee, priority, due date
- Search within category views
- Bulk operations on filtered tasks

### 3. **Analytics Integration**
- Track task movement between category statuses
- Measure category-specific metrics
- Generate reports per category

### 4. **Real-time Collaboration**
- Sync changes across multiple users
- Conflict resolution for simultaneous edits
- Audit trail for task changes

## Technical Notes

### Memory Efficiency
- No duplicate task objects
- Shared references for better performance
- Minimal memory footprint

### Type Safety
- Full TypeScript support
- Proper typing for task objects
- Compile-time error checking

### Error Handling
- Graceful fallbacks for missing data
- User-friendly error messages
- Robust validation

## Migration Path

The implementation maintains backward compatibility:
- Original `KanbanBoard` unchanged for "All Tasks"
- New `CategoryKanbanBoard` for category views
- Seamless switching between views
- No data migration required 