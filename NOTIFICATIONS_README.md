# Real-time Notification System - Setup Guide

## Overview
Complete notification system with database triggers, real-time Supabase subscriptions, and user preferences.

## Features
- ✅ Real-time notifications via Supabase Realtime
- ✅ Automatic notification creation on new messages and trade status changes
- ✅ User-configurable notification preferences
- ✅ Notification bell with shake animation
- ✅ Dropdown panel with unread count
- ✅ Mark as read functionality
- ✅ Backdrop blur styling
- ✅ Full RTL support

## Database Setup

### 1. Run the SQL Schema
Execute the SQL file to create the notification system:

```bash
# In Supabase SQL Editor, run:
database/notifications_schema.sql
```

This will create:
- `notifications` table
- Notification preference columns in `profiles` table
- Triggers for auto-creating notifications
- Helper functions for marking notifications as read

### 2. Enable Realtime
In your Supabase dashboard:
1. Go to **Database** → **Replication**
2. Enable realtime for the `notifications` table
3. Click **Save**

## Components

### NotificationDropdown
Location: `src/components/hub/NotificationDropdown.tsx`

Features:
- Real-time subscription to new notifications
- Shake animation on new notification arrival
- Unread count badge
- Mark individual notifications as read
- Mark all as read
- Clickable notifications with links

### Settings View
Location: `src/components/hub/views/SettingsView.tsx`

Added section:
- **Notification Preferences**
  - Toggle for new message notifications
  - Toggle for trade status notifications
  - Animated switches with Framer Motion

## How It Works

### 1. Automatic Notification Creation

**On New Message:**
```sql
-- Trigger: trigger_notify_new_message
-- When: A new message is inserted
-- Action: Creates notification for the recipient if they have notifications enabled
```

**On Trade Status Change:**
```sql
-- Trigger: trigger_notify_trade_status
-- When: A trade status is updated
-- Action: Creates notifications for both buyer and seller if they have notifications enabled
```

### 2. Real-time Updates

The `NotificationDropdown` component subscribes to Supabase Realtime:

```typescript
const channel = supabase
  .channel('notifications-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Add new notification to state
    // Trigger shake animation
    // Update unread count
  })
  .subscribe();
```

### 3. User Preferences

Users can control which notifications they receive:
- `notify_on_new_message` - Receive notifications for new messages
- `notify_on_trade_status` - Receive notifications for trade updates

These preferences are checked by the database triggers before creating notifications.

## Testing

### Test New Message Notification
1. Open two browser windows (different users)
2. Start a trade between them
3. Send a message from User A
4. User B should see:
   - Bell icon shake
   - Unread count increase
   - New notification in dropdown

### Test Trade Status Notification
1. Update a trade status (e.g., from Pending to Paid)
2. Both buyer and seller should receive notifications
3. Check that the notification appears in the dropdown

### Test Notification Preferences
1. Go to Settings → Notification Preferences
2. Disable "New Messages" toggle
3. Send a message to this user
4. Verify no notification is created

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('message', 'trade', 'system')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Profile Columns
```sql
ALTER TABLE profiles 
ADD COLUMN notify_on_new_message BOOLEAN DEFAULT true,
ADD COLUMN notify_on_trade_status BOOLEAN DEFAULT true;
```

## API Functions

### Mark Notification as Read
```typescript
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

### Mark All as Read
```typescript
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

### Get Unread Count
```typescript
const { count } = await supabase
  .from('notifications')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

## Styling

### Bell Shake Animation
```typescript
<motion.button
  animate={hasNewNotification ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
  transition={{ duration: 0.5 }}
>
  <Bell />
</motion.button>
```

### Backdrop Blur
```css
bg-white/95 backdrop-blur-xl
```

### Toggle Switch
```typescript
<button className={`relative w-14 h-7 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
  <motion.div
    animate={{ x: enabled ? 28 : 0 }}
    className="w-6 h-6 bg-white rounded-full shadow-md"
  />
</button>
```

## Troubleshooting

### Notifications Not Appearing
1. Check that Realtime is enabled for `notifications` table
2. Verify RLS policies are set correctly
3. Check browser console for subscription errors
4. Ensure user preferences are enabled

### Triggers Not Firing
1. Verify triggers exist: `\df` in psql
2. Check trigger function logic
3. Ensure notification preferences are true
4. Check for SQL errors in Supabase logs

### Unread Count Not Updating
1. Check that the subscription is active
2. Verify the `is_read` column is being updated
3. Ensure the count query filters correctly

## Performance Considerations

- Notifications are limited to last 10 in dropdown
- Indexes are created for fast queries
- RLS policies ensure users only see their notifications
- Real-time subscriptions are cleaned up on unmount

## Future Enhancements

- [ ] Email notifications
- [ ] Push notifications (PWA)
- [ ] Notification sound
- [ ] Notification history page
- [ ] Notification categories
- [ ] Snooze notifications
- [ ] Notification templates

## Support

For issues or questions, check:
- Supabase Realtime documentation
- Framer Motion animation docs
- Database trigger logs in Supabase
