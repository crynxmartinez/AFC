-- Add notification preferences to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notify_follows BOOLEAN DEFAULT true;

-- Create function to send follow notification
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the followed user wants follow notifications
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.following_id 
    AND notify_follows = true
  ) THEN
    -- Insert notification
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link,
      read
    ) VALUES (
      NEW.following_id,
      'follow',
      'New Follower',
      (SELECT username FROM users WHERE id = NEW.follower_id) || ' started following you',
      '/users/' || (SELECT username FROM users WHERE id = NEW.follower_id),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS on_follow_notify ON follows;
CREATE TRIGGER on_follow_notify
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Add index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(type);
