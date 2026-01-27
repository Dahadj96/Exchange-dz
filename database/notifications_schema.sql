-- ============================================
-- NOTIFICATION SYSTEM - DATABASE SCHEMA
-- ============================================

-- 1. Add notification preference columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notify_on_new_message BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_trade_status BOOLEAN DEFAULT true;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('message', 'trade', 'system')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ============================================

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    sender_name TEXT;
    trade_currency TEXT;
    notify_enabled BOOLEAN;
BEGIN
    -- Get the recipient (the other party in the trade)
    SELECT 
        CASE 
            WHEN t.buyer_id = NEW.sender_id THEN t.seller_id
            ELSE t.buyer_id
        END,
        l.currency
    INTO recipient_id, trade_currency
    FROM trades t
    JOIN listings l ON t.listing_id = l.id
    WHERE t.id = NEW.trade_id;

    -- Get sender name
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE id = NEW.sender_id;

    -- Check if recipient has notifications enabled
    SELECT notify_on_new_message INTO notify_enabled
    FROM profiles
    WHERE id = recipient_id;

    -- Only create notification if enabled
    IF notify_enabled THEN
        INSERT INTO notifications (user_id, title, content, type, link)
        VALUES (
            recipient_id,
            'رسالة جديدة',
            sender_name || ' أرسل رسالة في تداول ' || trade_currency,
            'message',
            '/dashboard'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_new_message();

-- Function to create notification for trade status changes
CREATE OR REPLACE FUNCTION notify_on_trade_status_change()
RETURNS TRIGGER AS $$
DECLARE
    buyer_notify_enabled BOOLEAN;
    seller_notify_enabled BOOLEAN;
    trade_currency TEXT;
    status_text TEXT;
BEGIN
    -- Only notify on status changes
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Get trade currency
    SELECT currency INTO trade_currency
    FROM listings
    WHERE id = NEW.listing_id;

    -- Get notification preferences
    SELECT notify_on_trade_status INTO buyer_notify_enabled
    FROM profiles WHERE id = NEW.buyer_id;

    SELECT notify_on_trade_status INTO seller_notify_enabled
    FROM profiles WHERE id = NEW.seller_id;

    -- Set status text based on new status
    CASE NEW.status
        WHEN 'AwaitingPayment' THEN status_text := 'في انتظار الدفع';
        WHEN 'Paid' THEN status_text := 'تم الدفع';
        WHEN 'AwaitingRelease' THEN status_text := 'في انتظار التأكيد';
        WHEN 'Completed' THEN status_text := 'مكتمل';
        WHEN 'Disputed' THEN status_text := 'متنازع عليه';
        ELSE status_text := NEW.status;
    END CASE;

    -- Notify buyer
    IF buyer_notify_enabled THEN
        INSERT INTO notifications (user_id, title, content, type, link)
        VALUES (
            NEW.buyer_id,
            'تحديث حالة التداول',
            'تداول ' || trade_currency || ' - ' || status_text,
            'trade',
            '/dashboard'
        );
    END IF;

    -- Notify seller
    IF seller_notify_enabled THEN
        INSERT INTO notifications (user_id, title, content, type, link)
        VALUES (
            NEW.seller_id,
            'تحديث حالة التداول',
            'تداول ' || trade_currency || ' - ' || status_text,
            'trade',
            '/dashboard'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trade status changes
DROP TRIGGER IF EXISTS trigger_notify_trade_status ON trades;
CREATE TRIGGER trigger_notify_trade_status
    AFTER UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_trade_status_change();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = true
    WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = auth.uid() AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count() TO authenticated;
