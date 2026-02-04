# Notification System Guide

## Overview

The Todo App now features a **complete notification system** that alerts users about VERY IMPORTANT tasks due within 6 hours. The system includes:

- 🔔 **Real-time Polling**: Fetches notifications every 30 seconds
- 🎨 **Beautiful Modal Alerts**: Custom purple-themed notification modals
- 📱 **Notification Dropdown**: Quick access to recent notifications from TopBar
- 🔴 **Unread Badge**: Dynamic badge showing unread notification count
- 💾 **Persistent Storage**: Notifications stored in localStorage (max 50)
- 🎯 **Priority-Based**: Only VERY_IMPORTANT tasks trigger alerts

## Architecture

### Backend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Notification Model** | `backend/models/notification.py` | Database model with CASCADE delete |
| **Notification Service** | `backend/services/notification_service.py` | CRUD operations + pruning |
| **Notification API** | `backend/api/v1/notifications.py` | REST endpoints |
| **Auto-trigger Logic** | `backend/services/task_service.py:364` | Creates notifications on task create/update |

### Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **NotificationModal** | `components/notifications/NotificationModal.tsx` | Beautiful alert modal |
| **NotificationDropdown** | `components/notifications/NotificationDropdown.tsx` | Quick notification panel |
| **NotificationProvider** | `components/notifications/NotificationProvider.tsx` | Global polling + modal manager |
| **Notification Store** | `stores/notificationStore.ts` | Zustand store with localStorage |
| **Polling Hook** | `hooks/useNotificationPolling.ts` | Background polling logic |
| **Sync Utilities** | `lib/notifications/notificationSync.ts` | Immediate sync helpers |

## User Flow

### 1. Task Creation Triggers Notification

When a user creates a VERY_IMPORTANT task due within 6 hours:

```typescript
// User creates task
await createTask({
  title: 'Urgent: Fix production bug',
  due_date: '2026-01-08T23:00:00Z', // 3 hours from now
  tags: ['Work', 'Urgent']
});

// Backend automatically:
// 1. Classifies priority as VERY_IMPORTANT (due to "Urgent" keyword)
// 2. Detects due_date within 6 hours
// 3. Creates notification in database
// 4. Returns task to frontend

// Frontend automatically:
// 1. Syncs notifications immediately (no 30s wait)
// 2. Shows success toast: "Task created. You'll be notified when it's due!"
```

### 2. Notification Polling Detects New Notification

Every 30 seconds, the `useNotificationPolling` hook:

```typescript
// Fetches notifications from backend
const response = await apiClient.getNotifications(false);

// Compares with last known IDs
const newNotifications = response.notifications.filter(
  (n) => !lastNotificationIdsRef.current.has(n.id)
);

// For VERY_IMPORTANT notifications:
if (notification.priority === 'VERY_IMPORTANT') {
  // Shows beautiful modal alert
  onNewNotification(notification);
}
```

### 3. User Sees Modal Alert

<img src="docs/notification-modal.png" alt="Notification Modal" width="400" />

The `NotificationModal` displays:
- 🎯 Animated gradient background (purple → pink → blue)
- 🔔 Pulsing bell icon
- 📝 Task message: "Task 'Fix bug' due in 2 hours"
- ⏰ Urgency badge: "Urgent - Requires immediate attention"
- 🎨 Purple theme with smooth animations
- ✅ Two actions: "Dismiss" or "View All"

### 4. Bell Icon Shows Unread Count

<img src="docs/bell-icon.png" alt="Bell Icon" width="200" />

The TopBar bell icon:
- 🔴 Shows unread count badge (e.g., "3")
- 🎵 Pulses every 3 seconds when unread > 0
- 🎨 Purple gradient badge
- 📱 Clicking opens notification dropdown

### 5. Notification Dropdown Panel

<img src="docs/notification-dropdown.png" alt="Notification Dropdown" width="300" />

The dropdown shows:
- 📋 5 most recent notifications
- ✅ "Mark all as read" button
- 🔴 Unread indicator dot
- ⏰ Relative timestamps ("3h ago")
- 🎨 Purple border for VERY_IMPORTANT
- 🔗 "View all notifications" link

### 6. Notifications Page

Full-featured page at `/notifications`:
- 📱 Filter: All / Unread / Read
- ✅ Click notification to mark as read
- 🔔 Mark all as read button
- 📊 Shows unread count
- 🎨 Beautiful purple-themed UI

## Configuration

### Polling Interval

Default: 30 seconds. To change:

```tsx
// app/layout.tsx
<NotificationProvider pollingInterval={60000}> {/* 60 seconds */}
  {children}
</NotificationProvider>
```

### Enable/Disable Polling

```tsx
<NotificationProvider enabled={false}>
  {children}
</NotificationProvider>
```

### Notification Threshold

Notifications trigger for tasks due within **6 hours**. To change:

```typescript
// lib/notifications/notificationSync.ts
const sixHoursMs = 6 * 60 * 60 * 1000; // Change to desired time
```

### Max Notifications Stored

Default: 50 notifications (FIFO queue). To change:

```typescript
// types/notification.types.ts
export const NOTIFICATION_CONFIG = {
  MAX_NOTIFICATIONS: 100, // Change to desired limit
  // ...
};
```

## API Endpoints

### GET /api/v1/notifications

Fetch notifications for authenticated user.

**Query Parameters:**
- `unread` (boolean): Filter to unread only (default: false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "user_id": "string",
      "message": "Task 'Fix bug' due in 2 hours",
      "priority": "VERY_IMPORTANT",
      "created_at": "2026-01-08T20:00:00Z",
      "read_at": null
    }
  ],
  "unread_count": 3,
  "total_count": 15
}
```

### PATCH /api/v1/notifications/{id}/read

Mark notification as read.

**Response:**
```json
{
  "id": "uuid",
  "read_at": "2026-01-08T20:05:00Z",
  // ... other fields
}
```

### PATCH /api/v1/notifications/mark-all-read

Mark all user's notifications as read.

**Response:**
```json
{
  "count": 5,
  "message": "5 notifications marked as read"
}
```

### GET /api/v1/notifications/unread/count

Get unread count only.

**Response:**
```json
{
  "count": 3
}
```

## Testing Guide

### 1. Test Notification Creation

```bash
# Create a VERY_IMPORTANT task due in 3 hours
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "URGENT: Fix critical bug",
    "due_date": "2026-01-08T23:00:00Z"
  }'

# Check notifications were created
curl http://localhost:8000/api/v1/notifications \
  -H "Authorization: Bearer <token>"
```

### 2. Test Frontend Polling

1. Open browser console
2. Watch for polling logs: `Fetching notifications...`
3. Create VERY_IMPORTANT task in another tab
4. Wait 30 seconds (or refresh notifications)
5. See modal alert appear

### 3. Test Notification Modal

1. Create VERY_IMPORTANT task due in 2 hours
2. Wait for modal to appear
3. Verify:
   - Purple gradient background ✅
   - Animated bell icon ✅
   - Task message displayed ✅
   - "Dismiss" and "View All" buttons ✅

### 4. Test Bell Icon Badge

1. Create 3 VERY_IMPORTANT tasks
2. Check TopBar bell icon shows "3" badge ✅
3. Click bell to open dropdown ✅
4. Mark one as read ✅
5. Badge should update to "2" ✅

### 5. Test Notification Dropdown

1. Click bell icon in TopBar
2. Verify dropdown shows:
   - Recent 5 notifications ✅
   - Unread indicator dots ✅
   - Relative timestamps ✅
   - "Mark all read" button ✅
   - "View all" link ✅

## Troubleshooting

### Notifications Not Appearing

**Problem**: Created VERY_IMPORTANT task but no notification

**Solutions**:
1. Check due date is within 6 hours: `console.log(new Date(due_date))`
2. Verify backend created notification: `GET /api/v1/notifications`
3. Check browser console for polling errors
4. Verify NotificationProvider is in layout.tsx
5. Check localStorage: `localStorage.getItem('notifications')`

### Polling Not Working

**Problem**: Notifications not updating automatically

**Solutions**:
1. Check NotificationProvider enabled prop
2. Verify polling interval: `console.log('Polling interval:', 30000)`
3. Check network tab for API calls every 30s
4. Ensure user is authenticated
5. Check for JavaScript errors in console

### Modal Not Showing

**Problem**: Notification created but modal doesn't appear

**Solutions**:
1. Verify notification priority is VERY_IMPORTANT
2. Check modal state in React DevTools
3. Ensure NotificationProvider wraps app
4. Check for CSS z-index conflicts
5. Verify framer-motion is installed

### Bell Badge Not Updating

**Problem**: Unread count not showing on bell icon

**Solutions**:
1. Check notification store: `useNotificationStore.getState()`
2. Verify TopBar imports useUnreadCount
3. Check localStorage: `localStorage.getItem('notifications')`
4. Clear localStorage and refresh
5. Verify Zustand devtools in browser

## Performance Considerations

### Polling Overhead

- **30-second interval**: ~120 requests/hour per user
- **Lightweight**: Only fetches new notifications
- **Duplicate prevention**: 10-minute window

### Storage Limits

- **localStorage**: Max 50 notifications (~50KB)
- **Auto-pruning**: Removes oldest read notifications
- **Backend pruning**: Keeps last 50 per user

### Optimization Tips

1. **Increase polling interval** for less frequent updates:
   ```tsx
   <NotificationProvider pollingInterval={60000} />
   ```

2. **Reduce max notifications** for lower storage:
   ```typescript
   MAX_NOTIFICATIONS: 25
   ```

3. **Disable polling** on inactive tabs:
   ```typescript
   useEffect(() => {
     if (document.hidden) {
       pause();
     } else {
       resume();
     }
   }, []);
   ```

## Future Enhancements

- [ ] WebSocket real-time notifications (no polling)
- [ ] Push notifications (Service Worker)
- [ ] Sound alerts for VERY_IMPORTANT tasks
- [ ] Email notifications for overdue tasks
- [ ] Notification preferences UI
- [ ] Snooze functionality
- [ ] Notification categories/filtering

## Summary

✅ **Backend**: Fully implemented with auto-triggers
✅ **Frontend**: Complete UI with polling, modals, and dropdown
✅ **Integration**: Immediate sync after task creation
✅ **UX**: Beautiful purple-themed alerts with animations
✅ **Performance**: Efficient polling with duplicate prevention

**Result: 100% Complete Notification System! 🎉**
