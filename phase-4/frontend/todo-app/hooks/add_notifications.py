#!/usr/bin/env python3
"""Add SweetAlert2 notification calls to useTasks.ts"""

import re

def add_notifications(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # createTask - add success notification after task creation
    content = re.sub(
        r'(const task = await apiClient\.createTask\(title, description\);)\s*\n(\s+setState\(\(prev\) => \(\{\s*\n\s+\.\.\.prev,\s*\n\s+tasks: \[\.\.\.prev\.tasks, task\],\s*\n\s+loading: false,\s*\n\s+\}\)\);)',
        r'\1\n\2\n\n        // Show success notification\n        await showSuccess("Task Created Successfully!", "Your task has been added.");',
        content
    )

    # createTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to create task";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)',
        r'\1\n\2\n\n        // Show error notification\n        await showError("Failed to Create Task", errorMessage);',
        content,
        count=1
    )

    # updateTask - add success notification
    content = re.sub(
        r'(const task = await apiClient\.updateTask\(id, updates\);)\s*\n(\s+setState\(\(prev\) => \(\{\s*\n\s+\.\.\.prev,\s*\n\s+tasks: prev\.tasks\.map\(\(t\) => \(t\.id === id \? task : t\)\),\s*\n\s+loading: false,\s*\n\s+\}\)\);)',
        r'\1\n\2\n\n        // Show success notification\n        await showSuccess("Task Updated Successfully!", "Your changes have been saved.");',
        content
    )

    # updateTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to update task";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)',
        r'\1\n\2\n\n        // Show error notification\n        await showError("Failed to Update Task", errorMessage);',
        content,
        count=1
    )

    # completeTask - add success notification
    content = re.sub(
        r'(const task = await apiClient\.completeTask\(id\);)\s*\n(\s+setState\(\(prev\) => \(\{\s*\n\s+\.\.\.prev,\s*\n\s+tasks: prev\.tasks\.map\(\(t\) => \(t\.id === id \? task : t\)\),\s*\n\s+loading: false,\s*\n\s+\}\)\);)',
        r'\1\n\2\n\n      // Show success notification\n      await showSuccess("Task Marked Complete!", "Great job completing this task.");',
        content
    )

    # completeTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to complete task";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)',
        r'\1\n\2\n\n      // Show error notification\n      await showError("Failed to Complete Task", errorMessage);',
        content,
        count=1
    )

    # incompleteTask - add success notification
    content = re.sub(
        r'(const task = await apiClient\.incompleteTask\(id\);)\s*\n(\s+setState\(\(prev\) => \(\{\s*\n\s+\.\.\.prev,\s*\n\s+tasks: prev\.tasks\.map\(\(t\) => \(t\.id === id \? task : t\)\),\s*\n\s+loading: false,\s*\n\s+\}\)\);)',
        r'\1\n\2\n\n      // Show success notification\n      await showSuccess("Task Marked Incomplete!", "Task moved back to active list.");',
        content
    )

    # incompleteTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to mark task incomplete";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)',
        r'\1\n\2\n\n      // Show error notification\n      await showError("Failed to Mark Incomplete", errorMessage);',
        content,
        count=1
    )

    # deleteTask - add success notification
    content = re.sub(
        r'(await apiClient\.deleteTask\(id\);)\s*\n(\s+setState\(\(prev\) => \(\{\s*\n\s+\.\.\.prev,\s*\n\s+tasks: prev\.tasks\.filter\(\(t\) => t\.id !== id\),\s*\n\s+loading: false,\s*\n\s+\}\)\);)',
        r'\1\n\2\n\n      // Show success notification\n      await showSuccess("Task Deleted Successfully!", "The task has been removed.");',
        content
    )

    # deleteTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to delete task";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)',
        r'\1\n\2\n\n      // Show error notification\n      await showError("Failed to Delete Task", errorMessage);',
        content,
        count=1
    )

    # getTask - add error notification
    content = re.sub(
        r'(const errorMessage = err instanceof Error \? err\.message : "Failed to fetch task";)\s*\n(\s+setState\(\(prev\) => \(\{ \.\.\.prev, loading: false, error: errorMessage \}\)\);)\s*\n(\s+throw err;)',
        r'\1\n\2\n\n        // Show error notification\n        await showError("Failed to Fetch Task", errorMessage);\n\n\3',
        content,
        count=1
    )

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("SUCCESS: Added all notification calls")

if __name__ == '__main__':
    add_notifications('useTasks.ts')
