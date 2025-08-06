#!/usr/bin/env python3
"""
Mock Data Switcher for Task Management Application

This script allows you to easily switch between different mock data files
for testing different scenarios in your task management application.

Usage:
    python switch_mock_data.py --source sample_tasks_mock.json --target updated_mock_tasks.json
    python switch_mock_data.py --list
    python switch_mock_data.py --backup
"""

import json
import argparse
import shutil
import os
from datetime import datetime

def list_available_files():
    """List all available mock data files in the current directory."""
    mock_files = [f for f in os.listdir('.') if f.endswith('.json') and 'mock' in f.lower()]
    print("Available mock data files:")
    for i, file in enumerate(mock_files, 1):
        print(f"  {i}. {file}")
    return mock_files

def backup_current_data():
    """Create a backup of the current updated_mock_tasks.json file."""
    if os.path.exists('updated_mock_tasks.json'):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f'updated_mock_tasks_backup_{timestamp}.json'
        shutil.copy2('updated_mock_tasks.json', backup_name)
        print(f"Backup created: {backup_name}")
        return backup_name
    else:
        print("No updated_mock_tasks.json file found to backup.")
        return None

def switch_mock_data(source_file, target_file='updated_mock_tasks.json'):
    """Switch the mock data by copying source_file to target_file."""
    try:
        # Validate source file exists
        if not os.path.exists(source_file):
            print(f"Error: Source file '{source_file}' not found.")
            return False
        
        # Read and validate source file
        with open(source_file, 'r') as f:
            data = json.load(f)
        
        # Validate structure
        if 'tasks' not in data:
            print(f"Error: Source file '{source_file}' does not contain 'tasks' array.")
            return False
        
        # Create backup of current target file if it exists
        if os.path.exists(target_file):
            backup_file = backup_current_data()
            if backup_file:
                print(f"Previous data backed up to: {backup_file}")
        
        # Copy source to target
        shutil.copy2(source_file, target_file)
        print(f"Successfully switched to: {source_file}")
        print(f"Target file updated: {target_file}")
        
        # Show summary of the new data
        task_count = len(data['tasks'])
        categories = set(task['category'] for task in data['tasks'])
        statuses = set(task['status'] for task in data['tasks'])
        
        print(f"\nData Summary:")
        print(f"  Total tasks: {task_count}")
        print(f"  Categories: {', '.join(sorted(categories))}")
        print(f"  Statuses: {', '.join(sorted(statuses))}")
        
        # Show parent tasks with subtasks
        parent_tasks = [task for task in data['tasks'] if task.get('subtasks')]
        if parent_tasks:
            print(f"  Parent tasks with subtasks: {len(parent_tasks)}")
            for task in parent_tasks:
                print(f"    - {task['title']} ({len(task['subtasks'])} subtasks)")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in source file: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Switch mock data files for task management app')
    parser.add_argument('--source', help='Source mock data file')
    parser.add_argument('--target', default='updated_mock_tasks.json', help='Target file (default: updated_mock_tasks.json)')
    parser.add_argument('--list', action='store_true', help='List available mock data files')
    parser.add_argument('--backup', action='store_true', help='Create backup of current data')
    
    args = parser.parse_args()
    
    if args.list:
        list_available_files()
    elif args.backup:
        backup_current_data()
    elif args.source:
        switch_mock_data(args.source, args.target)
    else:
        print("Available commands:")
        print("  --list: List available mock data files")
        print("  --backup: Create backup of current data")
        print("  --source <file>: Switch to specified mock data file")
        print("\nExample:")
        print("  python switch_mock_data.py --source sample_tasks_mock.json")
        print("  python switch_mock_data.py --list")

if __name__ == "__main__":
    main() 