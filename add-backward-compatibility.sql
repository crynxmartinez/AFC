-- ============================================
-- ADD BACKWARD COMPATIBILITY
-- ============================================
-- This allows old code to work while new code deploys

-- Create a VIEW that makes comment_likes work like before
CREATE OR REPLACE VIEW comment_likes AS
SELECT 
  user_id,
  comment_id,
  created_at
FROM comment_reactions
WHERE reaction_type = 'like';

-- Create INSERT trigger on the view
CREATE OR REPLACE FUNCTION comment_likes_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO comment_reactions (user_id, comment_id, reaction_type)
  VALUES (NEW.user_id, NEW.comment_id, 'like')
  ON CONFLICT (user_id, comment_id, reaction_type) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_likes_insert_trigger
INSTEAD OF INSERT ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION comment_likes_insert();

-- Create DELETE trigger on the view
CREATE OR REPLACE FUNCTION comment_likes_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM comment_reactions
  WHERE user_id = OLD.user_id 
    AND comment_id = OLD.comment_id
    AND reaction_type = 'like';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_likes_delete_trigger
INSTEAD OF DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION comment_likes_delete();

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON comment_likes TO authenticated;

SELECT 'Backward compatibility added. Old code will now work!' as result;
