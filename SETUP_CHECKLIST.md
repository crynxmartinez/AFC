# AFC Setup Checklist

## ✅ Steps to Complete Before Creating Contests

### 1. Run Supabase Storage Setup SQL
You MUST run the `supabase-storage-setup.sql` script in your Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy the contents of `supabase-storage-setup.sql`
3. Paste and run it
4. This creates the storage buckets: `contest-thumbnails`, `entry-artworks`, `user-avatars`

### 2. Create an Admin User
Run this SQL to make your user an admin:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 3. Verify Storage Buckets
Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets

You should see:
- ✅ contest-thumbnails (public)
- ✅ entry-artworks (public)
- ✅ user-avatars (public)

### 4. Check Browser Console
When creating a contest, open DevTools (F12) and check the Console tab for errors.

## Common Issues

### "Nothing happens" when creating contest
**Causes:**
1. Storage buckets not created → Run the SQL script
2. Not logged in → Check if user is authenticated
3. Not an admin → Update user role to 'admin'
4. Silent error → Check browser console (F12)

### Storage upload fails
**Causes:**
1. Bucket doesn't exist → Run storage setup SQL
2. RLS policies not set → Run storage setup SQL
3. File too large → Max 5MB for thumbnails

## Testing Steps

1. **Sign up/Login** at http://localhost:5173
2. **Make yourself admin** using SQL above
3. **Navigate to** http://localhost:5173/admin/contests/new
4. **Fill the form** with:
   - Title: "Test Contest"
   - Description: "Testing"
   - Start Date: Today
   - End Date: Tomorrow
5. **Click "Create Contest"**
6. **Check console** (F12) for any errors
7. **Should see** success alert and redirect to contests list
