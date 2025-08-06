# Mock Data Integration Guide

## Overview

This guide explains how to use the new mock data integration system for testing different scenarios in your task management application.

## Files Created

### 1. `sample_tasks_mock.json`
New mock data file containing 8 tasks with the following structure:
- **1 parent task with 2 subtasks**: Budget category task in "Created" status
- **7 individual tasks**: Various categories with different statuses
- **Comprehensive data structure**: Includes all required fields (assignee, teamMembers, tags, etc.)

### 2. `switch_mock_data.py`
Python utility script for easily switching between different mock data files.

## Task Structure

The new mock data follows your existing application structure:

```json
{
  "stage_mapping": {
    "Created": ["draft", "new", "to_do", "requested", "backlog"],
    "Active": ["in_progress", "in_review", "scheduled", "working", "ongoing", "doing", "assigned"],
    "Paused": ["paused", "waiting", "on_hold", "blocked", "needs_input", "needs_work"],
    "Completed": ["done", "approved", "paid", "completed", "closed", "validated"],
    "Rejected": ["rejected", "declined", "canceled", "terminated"]
  },
  "tasks": [
    {
      "id": "BGT-001",
      "taskId": "BGT-001",
      "title": "Approve Q4 Budget Plan",
      "category": "Budget",
      "status": "draft",
      "stage": "Created",
      "priority": "High",
      "assignee": { "name": "Marley Bergson", "initials": "MB", "department": "Finance" },
      "teamMembers": [...],
      "subtasks": [...],
      "tags": ["budget", "planning", "quarterly"],
      "dueDate": "2024-12-30",
      "progress": 25,
      "department": "Finance",
      "type": "Task",
      "clientInfo": "Internal",
      "description": "...",
      "attachmentCount": 8,
      "commentCount": 12,
      "lastStatusChange": "2024-11-20T09:00:00Z"
    }
  ]
}
```

## New Tasks Included

### 1. Budget Category (Parent Task with Subtasks)
- **BGT-001**: "Approve Q4 Budget Plan" (draft status)
  - **BGT-001-1**: "Review Department Budgets" (subtask)
  - **BGT-001-2**: "Finalize Executive Summary" (subtask)

### 2. Individual Tasks
- **INV-002**: "Due Diligence for Startup X" (Investment, in_review)
- **HR-003**: "Conduct Onboarding for New Hires" (HR, to_do)
- **ACC-004**: "Monthly Payroll Processing" (Accounting, completed)
- **PHL-005**: "Plan Winter Charity Event" (Philanthropy, in_progress)
- **TRV-006**: "Book Flights for Annual Summit" (Travel, paused)
- **FD-007**: "Review Office Catering Proposals" (Food, to_do)
- **LGL-008**: "Update NDA Templates" (Legal, in_progress)

## Usage

### Switch to New Mock Data
```bash
python3 switch_mock_data.py --source sample_tasks_mock.json
```

### List Available Mock Data Files
```bash
python3 switch_mock_data.py --list
```

### Create Backup of Current Data
```bash
python3 switch_mock_data.py --backup
```

### Restore Previous Data
```bash
python3 switch_mock_data.py --source updated_mock_tasks_backup_YYYYMMDD_HHMMSS.json
```

## Features

### 1. Automatic Backup
- Creates timestamped backups before switching data
- Preserves your existing data for easy restoration

### 2. Data Validation
- Validates JSON structure before switching
- Ensures required fields are present
- Provides detailed error messages

### 3. Data Summary
- Shows task count, categories, and statuses
- Lists parent tasks with subtask counts
- Helps verify data integrity

### 4. Easy Integration
- Works with your existing application structure
- No code changes required
- Seamless switching between different test scenarios

## Testing Scenarios

### Scenario 1: Parent-Child Relationships
- Test task expansion/collapse
- Verify subtask status inheritance
- Check parent-child status transitions

### Scenario 2: Different Categories
- Test category-specific filtering
- Verify status rules per category
- Check category-based workflows

### Scenario 3: Various Statuses
- Test status transitions
- Verify workflow rules
- Check status-specific UI elements

### Scenario 4: Different Priorities
- Test priority-based sorting
- Verify priority indicators
- Check priority-based filtering

## Benefits

1. **Consistent Testing**: Same data structure across all scenarios
2. **Easy Switching**: Quick change between different test cases
3. **Data Safety**: Automatic backups prevent data loss
4. **Validation**: Ensures data integrity before switching
5. **Documentation**: Clear structure and comprehensive metadata

## Next Steps

1. **Test the new data** in your application
2. **Create additional scenarios** by modifying the JSON files
3. **Add more task variations** for comprehensive testing
4. **Document specific test cases** for each scenario

## Troubleshooting

### Common Issues

1. **"Source file not found"**
   - Check file exists in current directory
   - Verify filename spelling

2. **"Invalid JSON"**
   - Validate JSON syntax
   - Check for missing commas/brackets

3. **"No tasks array"**
   - Ensure file has correct structure
   - Check for proper JSON formatting

### Recovery

If something goes wrong:
1. Use `--list` to see available files
2. Use `--backup` to create current backup
3. Restore from previous backup file
4. Check application logs for errors 