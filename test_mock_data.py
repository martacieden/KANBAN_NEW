#!/usr/bin/env python3
"""
Test script to verify mock data structure and compatibility
"""

import json
import sys

def test_mock_data_structure(file_path):
    """Test the structure of mock data file."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        print(f"Testing file: {file_path}")
        print("=" * 50)
        
        # Check required top-level keys
        required_keys = ['stage_mapping', 'tasks']
        for key in required_keys:
            if key not in data:
                print(f"❌ Missing required key: {key}")
                return False
            else:
                print(f"✅ Found required key: {key}")
        
        # Check stage_mapping structure
        stage_mapping = data['stage_mapping']
        expected_stages = ['Created', 'Active', 'Paused', 'Completed', 'Rejected']
        for stage in expected_stages:
            if stage not in stage_mapping:
                print(f"❌ Missing stage: {stage}")
                return False
            else:
                print(f"✅ Found stage: {stage} ({len(stage_mapping[stage])} statuses)")
        
        # Check tasks structure
        tasks = data['tasks']
        print(f"✅ Found {len(tasks)} tasks")
        
        # Check each task structure
        required_task_fields = ['id', 'taskId', 'title', 'category', 'status', 'stage', 'priority', 'assignee']
        optional_task_fields = ['subtasks', 'teamMembers', 'tags', 'dueDate', 'progress', 'department', 'type', 'clientInfo', 'description', 'attachmentCount', 'commentCount', 'lastStatusChange']
        
        for i, task in enumerate(tasks):
            print(f"\nTask {i+1}: {task.get('title', 'Unknown')}")
            
            # Check required fields
            for field in required_task_fields:
                if field not in task:
                    print(f"  ❌ Missing required field: {field}")
                    return False
                else:
                    print(f"  ✅ {field}: {task[field]}")
            
            # Check optional fields
            for field in optional_task_fields:
                if field in task:
                    value = task[field]
                    if field == 'subtasks':
                        print(f"  ✅ {field}: {len(value)} subtasks")
                    elif field == 'teamMembers':
                        print(f"  ✅ {field}: {len(value)} members")
                    else:
                        print(f"  ✅ {field}: {value}")
                else:
                    print(f"  ⚠️  Missing optional field: {field}")
            
            # Check subtasks if present
            if 'subtasks' in task and task['subtasks']:
                print(f"    Subtasks:")
                for j, subtask in enumerate(task['subtasks']):
                    print(f"      {j+1}. {subtask.get('title', 'Unknown')} ({subtask.get('status', 'Unknown')})")
        
        # Summary
        print("\n" + "=" * 50)
        print("SUMMARY:")
        print(f"✅ Total tasks: {len(tasks)}")
        
        categories = set(task['category'] for task in tasks)
        print(f"✅ Categories: {', '.join(sorted(categories))}")
        
        statuses = set(task['status'] for task in tasks)
        print(f"✅ Statuses: {', '.join(sorted(statuses))}")
        
        parent_tasks = [task for task in tasks if task.get('subtasks')]
        print(f"✅ Parent tasks with subtasks: {len(parent_tasks)}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 test_mock_data.py <file_path>")
        print("Example: python3 test_mock_data.py sample_tasks_mock.json")
        sys.exit(1)
    
    file_path = sys.argv[1]
    success = test_mock_data_structure(file_path)
    
    if success:
        print("\n🎉 All tests passed! The mock data structure is valid.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed! Please check the mock data structure.")
        sys.exit(1)

if __name__ == "__main__":
    main() 