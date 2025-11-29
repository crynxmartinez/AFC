-- Fix RLS policy for comment pinning
-- Entry owners should be able to update is_pinned on comments for their entries

-- First, let's check and create a policy for entry owners to pin comments
CREATE POLICY "Entry owners can pin comments on their entries"
ON entry_comments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM entries 
    WHERE entries.id = entry_comments.entry_id 
    AND entries.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM entries 
    WHERE entries.id = entry_comments.entry_id 
    AND entries.user_id = auth.uid()
  )
);

-- Alternative: If the above fails due to existing policy, use this instead:
-- DROP POLICY IF EXISTS "Entry owners can pin comments on their entries" ON entry_comments;
-- Then run the CREATE POLICY again
