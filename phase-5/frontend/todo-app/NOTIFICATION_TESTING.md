# Notification System Testing Guide

## Quick Start Testing

### 1. Start Both Servers

```bash
# Terminal 1 - Backend
cd phase-4/backend
uv run uvicorn src.main:app --reload --port 8000

# Terminal 2 - Frontend
cd phase-4/frontend/todo-app
npm run dev
```

### 2. Open Test Page

Navigate to: `http://localhost:3000/test-notifications`

This page provides real-time debugging information:
- Frontend store notification count
- Backend notification count
- Polling status
- Ability to create test tasks
- Manual notification testing

### 3. Open Browser Console

Press `F12` and go to the Console tab. You should see:

```
[NotificationProvider] Auth status: { isAuthenticated: true, isLoading: false }
[NotificationPolling] Fetching notifications from backend...
[NotificationPolling] Received X notifications from backend
[NotificationPolling] Found Y new notifications
```

## Test Scenarios

### Scenario 1: Create VERY_IMPORTANT Task

**Steps:**
1. Go to `/tasks` page
2. Click "Create Task"
3. Enter:
   - Title: "URGENT: Fix critical bug"
   - Due date: 3 hours from now
   - Save

**Expected Behavior:**
1. ✅ Success toast shows: "Task created. You'll be notified when it's due!"
2. ✅ Console log: `[NotificationPolling] Fetching notifications...`
3. ✅ Within 30 seconds, console log: `[NotificationPolling] Found 1 new notifications`
4. ✅ Modal appears with purple theme and task message
5. ✅ Bell icon in TopBar shows badge "1"
6. ✅ Clicking bell shows notification in dropdown

### Scenario 2: Check Backend Created Notification

**Steps:**
1. Create VERY_IMPORTANT task (as above)
2. Open: `http://localhost:8000/api/v1/notifications`
3. You should see JSON response with your notification

**Expected Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "message": "Task 'URGENT: Fix critical bug' due in 3 hours",
      "priority": "VERY_IMPORTANT",
      "created_at": "2026-01-08T...",
      "read_at": null
    }
  ],
  "unread_count": 1,
  "total_count": 1
}
```

### Scenario 3: Test Notification Modal

**Steps:**
1. Go to `/test-notifications`
2. Scroll to "Manual Store Actions"
3. Click "Show Test Modal"

**Expected Behavior:**
1. ✅ Modal appears with purple gradient background
2. ✅ Bell icon is animated/pulsing
3. ✅ "Dismiss" and "View All" buttons work
4. ✅ Smooth animations (fade in, scale)

### Scenario 4: Test Bell Icon Badge

**Steps:**
1. Create 3 VERY_IMPORTANT tasks due in 3 hours each
2. Wait 30 seconds for polling
3. Check TopBar bell icon

**Expected Behavior:**
1. ✅ Badge shows "3"
2. ✅ Badge has purple gradient
3. ✅ Bell icon pulses every 3 seconds
4. ✅ Clicking bell opens dropdown with 3 notifications

### Scenario 5: Test Notification Dropdown

**Steps:**
1. Click bell icon in TopBar
2. Dropdown should appear

**Expected Behavior:**
1. ✅ Shows up to 5 most recent notifications
2. ✅ Each notification has:
   - Priority icon
   - Message text
   - Relative timestamp ("3h ago")
   - Unread indicator dot
3. ✅ "Mark all as read" button at top
4. ✅ "View all notifications" link at bottom
5. ✅ Clicking notification marks it as read
6. ✅ Badge count updates after marking as read

### Scenario 6: Test Notification Page

**Steps:**
1. Go to `/notifications` page

**Expected Behavior:**
1. ✅ Shows all notifications
2. ✅ Filter tabs: All / Unread / Read
3. ✅ Click notification to mark as read
4. ✅ "Mark all as read" button works
5. ✅ Empty state if no notifications

### Scenario 7: Test localStorage Persistence

**Steps:**
1. Create 5 VERY_IMPORTANT tasks
2. Wait for notifications to appear
3. Refresh page (F5)
4. Check bell icon badge

**Expected Behavior:**
1. ✅ Badge still shows "5"
2. ✅ Notifications persist in store
3. ✅ Console: `localStorage.getItem('notifications')` shows data

### Scenario 8: Test Non-VERY_IMPORTANT Task

**Steps:**
1. Create task with title: "Normal task"
2. Due date: 3 hours from now
3. Save

**Expected Behavior:**
1. ✅ Task creates successfully
2. ✅ Priority classified as LOW/MEDIUM
3. ✅ NO notification created
4. ✅ Bell badge does NOT increase

## Common Issues & Solutions

### Issue 1: "No notifications appearing"

**Symptoms:**
- Created VERY_IMPORTANT task
- No modal appears
- Bell badge shows 0

**Debug Steps:**
1. Check browser console for errors
2. Go to `/test-notifications` and check:
   - Backend count vs Frontend count
   - Polling status
   - Authentication status
3. Check backend API directly:
   ```bash
   curl http://localhost:8000/api/v1/notifications \
     -H "Cookie: session=YOUR_SESSION_COOKIE"
   ```

**Common Causes:**
- Not authenticated (check `Auth status: { isAuthenticated: true }`)
- Backend not running (check `http://localhost:8000/api/v1/health`)
- Task due date > 6 hours (notifications only for due within 6h)
- Task priority not VERY_IMPORTANT (check title has "urgent" keyword)

### Issue 2: "Polling not working"

**Symptoms:**
- Console shows: `[NotificationPolling] Fetching...` only once
- No repeated polling every 30 seconds

**Debug Steps:**
1. Check console for:
   ```
   [NotificationProvider] Auth status: { isAuthenticated: true, isLoading: false }
   ```
2. If `isAuthenticated: false`, login again
3. If polling stops, check for JavaScript errors

**Solution:**
- Ensure NotificationProvider is in `app/layout.tsx`
- Verify authentication is working
- Check no JavaScript errors blocking execution

### Issue 3: "Modal not appearing"

**Symptoms:**
- Notification created (shows in `/test-notifications`)
- Modal doesn't pop up

**Debug Steps:**
1. Check console for:
   ```
   [NotificationPolling] Triggering modal for VERY_IMPORTANT notification: ...
   ```
2. If log appears but no modal, check:
   - z-index conflicts (modal should be z-50)
   - framer-motion installed: `npm list framer-motion`
   - No CSS blocking modal

**Solution:**
```bash
cd phase-4/frontend/todo-app
npm install framer-motion
npm run dev
```

### Issue 4: "Bell badge not updating"

**Symptoms:**
- Notifications exist
- Badge shows wrong count or nothing

**Debug Steps:**
1. Open React DevTools
2. Find TopBar component
3. Check `unreadCount` prop value
4. Open browser console:
   ```javascript
   // Check store state
   const state = window.localStorage.getItem('notifications');
   console.log(JSON.parse(state));
   ```

**Solution:**
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Create new test notification

### Issue 5: "Notifications not syncing immediately"

**Symptoms:**
- Created VERY_IMPORTANT task
- Have to wait 30 seconds for notification

**Debug Steps:**
1. Check `useTasks.ts:178` has:
   ```typescript
   if (shouldNotifyForTask(createdTask.priority, createdTask.due_date)) {
     syncNotifications().catch(console.error);
   }
   ```
2. Check console for: `Syncing notifications...`

**Solution:**
- Verify `syncNotifications()` is called after task creation
- Check no errors in console

## Manual Backend Testing

### Test Backend API Directly

```bash
# Get auth token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Save the token from response
TOKEN="your_jwt_token_here"

# Create VERY_IMPORTANT task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "URGENT: Test task",
    "due_date": "'$(date -u -d '+3 hours' +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Check notifications were created
curl http://localhost:8000/api/v1/notifications \
  -H "Authorization: Bearer $TOKEN"

# Should see notification with:
# - priority: "VERY_IMPORTANT"
# - message: "Task 'URGENT: Test task' due in X hours"
# - read_at: null
```

## Verification Checklist

Before considering notifications "working", verify ALL of these:

### Backend ✅
- [ ] Notification model exists in database
- [ ] Notifications API endpoint responds: `/api/v1/notifications`
- [ ] Creating VERY_IMPORTANT task creates notification
- [ ] Notification message format correct: "Task 'X' due in Y hours"
- [ ] Notifications deleted when task deleted (CASCADE)

### Frontend ✅
- [ ] NotificationProvider in `app/layout.tsx`
- [ ] Polling runs every 30 seconds (check console logs)
- [ ] New notifications trigger modal
- [ ] Modal has purple theme and animations
- [ ] Bell icon shows unread badge
- [ ] Bell badge updates when marked as read
- [ ] Dropdown shows 5 most recent notifications
- [ ] Clicking notification marks as read
- [ ] `/notifications` page shows all notifications
- [ ] localStorage persists notifications across refreshes

### Integration ✅
- [ ] Creating task immediately syncs notifications
- [ ] Success toast mentions notifications for VERY_IMPORTANT tasks
- [ ] Polling detects new notifications within 30 seconds
- [ ] Mark as read syncs with backend
- [ ] Unread count matches between frontend and backend

## Performance Testing

### Test with Many Notifications

```bash
# Create 50 VERY_IMPORTANT tasks
for i in {1..50}; do
  curl -X POST http://localhost:8000/api/v1/tasks \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"URGENT: Task $i\",
      \"due_date\": \"$(date -u -d '+3 hours' +%Y-%m-%dT%H:%M:%SZ)\"
    }"
  sleep 0.5
done

# Verify:
# - localStorage only keeps 50 (FIFO)
# - Backend auto-prunes to 50
# - UI remains responsive
# - Dropdown shows only 5 most recent
```

## Success Criteria

Notifications system is **100% working** when:

1. ✅ Creating VERY_IMPORTANT task triggers notification creation
2. ✅ Notification appears in backend API response
3. ✅ Frontend polling fetches notification within 30 seconds
4. ✅ Beautiful modal pops up with purple theme
5. ✅ Bell icon shows accurate unread count with pulsing animation
6. ✅ Dropdown displays recent notifications with mark-as-read
7. ✅ All notifications visible on `/notifications` page
8. ✅ localStorage persists notifications across page refreshes
9. ✅ Console logs show polling activity every 30 seconds
10. ✅ No JavaScript errors in console

---

**If ALL 10 criteria pass, notifications are fully functional! 🎉**
