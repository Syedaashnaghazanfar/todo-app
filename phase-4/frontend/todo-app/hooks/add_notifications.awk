#!/usr/bin/awk -f

# Track state
/const getTask = useCallback\(/ { in_getTask = 1 }
/const createTask = useCallback\(/ { in_createTask = 1; in_getTask = 0 }
/const updateTask = useCallback\(/ { in_updateTask = 1; in_createTask = 0 }
/const completeTask = useCallback\(/ { in_completeTask = 1; in_updateTask = 0 }
/const incompleteTask = useCallback\(/ { in_incompleteTask = 1; in_completeTask = 0 }
/const deleteTask = useCallback\(/ { in_deleteTask = 1; in_incompleteTask = 0 }

# getTask - add error notification
in_getTask && /const errorMessage = err instanceof Error \? err.message : "Failed to fetch task";/ {
    print
    getline; print  # setState line
    print ""
    print "        // Show error notification"
    print "        await showError(\"Failed to Fetch Task\", errorMessage);"
    print ""
    next
}

# createTask - add success and error notifications
in_createTask && /setState\(\(prev\) => \(\{/ {
    print
    getline; if ($0 ~ /...prev,/) print
    getline; if ($0 ~ /tasks:/) print
    getline; if ($0 ~ /loading: false,/) print
    getline; if ($0 ~ /\}\)\);/) {
        print "        }));"
        print ""
        print "        // Show success notification"
        print "        await showSuccess(\"Task Created Successfully!\", \"Your task has been added.\");"
        print ""
        next
    }
}

in_createTask && /const errorMessage = err instanceof Error \? err.message : "Failed to create task";/ {
    print
    getline; print  # setState line
    print ""
    print "        // Show error notification"
    print "        await showError(\"Failed to Create Task\", errorMessage);"
    print ""
    next
}

# updateTask - add success and error notifications
in_updateTask && /setState\(\(prev\) => \(\{/ {
    print
    getline; if ($0 ~ /...prev,/) print
    getline; if ($0 ~ /tasks:/) print
    getline; if ($0 ~ /loading: false,/) print
    getline; if ($0 ~ /\}\)\);/) {
        print "        }));"
        print ""
        print "        // Show success notification"
        print "        await showSuccess(\"Task Updated Successfully!\", \"Your changes have been saved.\");"
        print ""
        next
    }
}

in_updateTask && /const errorMessage = err instanceof Error \? err.message : "Failed to update task";/ {
    print
    getline; print  # setState line
    print ""
    print "        // Show error notification"
    print "        await showError(\"Failed to Update Task\", errorMessage);"
    print ""
    next
}

# completeTask - add success and error notifications
in_completeTask && /setState\(\(prev\) => \(\{/ {
    print
    getline; if ($0 ~ /...prev,/) print
    getline; if ($0 ~ /tasks:/) print
    getline; if ($0 ~ /loading: false,/) print
    getline; if ($0 ~ /\}\)\);/) {
        print "      }));"
        print ""
        print "      // Show success notification"
        print "      await showSuccess(\"Task Marked Complete!\", \"Great job completing this task.\");"
        print ""
        next
    }
}

in_completeTask && /const errorMessage = err instanceof Error \? err.message : "Failed to complete task";/ {
    print
    getline; print  # setState line
    print ""
    print "      // Show error notification"
    print "      await showError(\"Failed to Complete Task\", errorMessage);"
    print ""
    next
}

# incompleteTask - add success and error notifications
in_incompleteTask && /setState\(\(prev\) => \(\{/ {
    print
    getline; if ($0 ~ /...prev,/) print
    getline; if ($0 ~ /tasks:/) print
    getline; if ($0 ~ /loading: false,/) print
    getline; if ($0 ~ /\}\)\);/) {
        print "      }));"
        print ""
        print "      // Show success notification"
        print "      await showSuccess(\"Task Marked Incomplete!\", \"Task moved back to active list.\");"
        print ""
        next
    }
}

in_incompleteTask && /const errorMessage = err instanceof Error \? err.message : "Failed to mark task incomplete";/ {
    print
    getline; print  # setState line
    print ""
    print "      // Show error notification"
    print "      await showError(\"Failed to Mark Incomplete\", errorMessage);"
    print ""
    next
}

# deleteTask - add success and error notifications
in_deleteTask && /setState\(\(prev\) => \(\{/ {
    print
    getline; if ($0 ~ /...prev,/) print
    getline; if ($0 ~ /tasks:/) print
    getline; if ($0 ~ /loading: false,/) print
    getline; if ($0 ~ /\}\)\);/) {
        print "      }));"
        print ""
        print "      // Show success notification"
        print "      await showSuccess(\"Task Deleted Successfully!\", \"The task has been removed.\");"
        print ""
        next
    }
}

in_deleteTask && /const errorMessage = err instanceof Error \? err.message : "Failed to delete task";/ {
    print
    getline; print  # setState line
    print ""
    print "      // Show error notification"
    print "      await showError(\"Failed to Delete Task\", errorMessage);"
    print ""
    next
}

# Default: print line as-is
{ print }
