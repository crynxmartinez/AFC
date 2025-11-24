# 🔄 **SUPABASE MIGRATION GUIDE**

Complete guide to migrate Arena for Creatives to a new Supabase project.

---

## **📋 PREREQUISITES**

Before starting:
- [ ] Create new Supabase project on paid account
- [ ] Backup current database (just in case)
- [ ] Have Vercel access ready
- [ ] Set aside 1-2 hours

---

## **🎯 MIGRATION STEPS**

### **STEP 1: CREATE NEW SUPABASE PROJECT**

**1.1 Go to Supabase Dashboard:**
```
https://supabase.com/dashboard
```

**1.2 Create New Project:**
- Click "New Project"
- Name: `Arena for Creatives` (or your choice)
- Database Password: **SAVE THIS!**
- Region: Choose closest to your users
- Plan: Pro ($25/month)
- Click "Create new project"

**1.3 Wait for Setup:**
- Takes 2-3 minutes
- Don't close the page

---

### **STEP 2: RUN DATABASE SCRIPTS**

**2.1 Open SQL Editor:**
```
Dashboard → SQL Editor → New Query
```

**2.2 Run Scripts in Order:**

**Script 1: Schema**
- Open `01-schema.sql`
- Copy all content
- Paste in SQL Editor
- Click "Run"
- ✅ Wait for success

**Script 2: RLS Policies**
- Open `02-rls-policies.sql`
- Copy all content
- Paste in SQL Editor
- Click "Run"
- ✅ Wait for success

**Script 3: Functions**
- Open `03-functions.sql`
- Copy all content
- Paste in SQL Editor
- Click "Run"
- ✅ Wait for success

**Script 4: Triggers**
- Open `04-triggers.sql`
- Copy all content
- Paste in SQL Editor
- Click "Run"
- ✅ Wait for success

**Script 5: XP System**
- Open `05-xp-system.sql`
- Copy all content
- Paste in SQL Editor
- Click "Run"
- ✅ Wait for success

---

### **STEP 3: CONFIGURE STORAGE**

**3.1 Go to Storage:**
```
Dashboard → Storage
```

**3.2 Create Buckets:**

**Bucket 1: avatars**
- Click "Create bucket"
- Name: `avatars`
- Public: ✅ Yes
- Click "Create"

**Bucket 2: entries**
- Click "Create bucket"
- Name: `entries`
- Public: ✅ Yes
- Click "Create"

**Bucket 3: contests**
- Click "Create bucket"
- Name: `contests`
- Public: ✅ Yes
- Click "Create"

**Bucket 4: cover-photos**
- Click "Create bucket"
- Name: `cover-photos`
- Public: ✅ Yes
- Click "Create"

**3.3 Set Storage Policies:**

For each bucket, go to **Policies** and add:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'BUCKET_NAME');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'BUCKET_NAME' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Users can update own files**
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'BUCKET_NAME' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Users can delete own files**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'BUCKET_NAME' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Replace `BUCKET_NAME` with: `avatars`, `entries`, `contests`, `cover-photos`

---

### **STEP 4: GET NEW API KEYS**

**4.1 Go to Settings:**
```
Dashboard → Settings → API
```

**4.2 Copy These Values:**
```
Project URL: https://XXXXXXXX.supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (keep secret!)
```

**4.3 Save to `.env.local`:**
```bash
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

### **STEP 5: UPDATE VERCEL ENVIRONMENT VARIABLES**

**5.1 Go to Vercel Dashboard:**
```
https://vercel.com/dashboard
→ Your AFC Project
→ Settings
→ Environment Variables
```

**5.2 Update Variables:**

**Delete old variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Add new variables:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://XXXXXXXX.supabase.co` (your new URL)
- Environments: Production, Preview, Development
- Click "Save"

- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGc...` (your new anon key)
- Environments: Production, Preview, Development
- Click "Save"

---

### **STEP 6: MIGRATE DATA (OPTIONAL)**

**If you have existing users/data:**

**6.1 Export from Old Database:**
```sql
-- Export users
COPY (SELECT * FROM users) TO '/tmp/users.csv' CSV HEADER;

-- Export contests
COPY (SELECT * FROM contests) TO '/tmp/contests.csv' CSV HEADER;

-- Export entries
COPY (SELECT * FROM entries) TO '/tmp/entries.csv' CSV HEADER;

-- etc...
```

**6.2 Import to New Database:**
```sql
-- Import users
COPY users FROM '/tmp/users.csv' CSV HEADER;

-- Import contests
COPY contests FROM '/tmp/contests.csv' CSV HEADER;

-- Import entries
COPY entries FROM '/tmp/entries.csv' CSV HEADER;

-- etc...
```

**Note:** For soft launch with no users, skip this step!

---

### **STEP 7: CONFIGURE EMAIL TEMPLATES**

**7.1 Go to Authentication:**
```
Dashboard → Authentication → Email Templates
```

**7.2 Update Sender:**
- Sender name: `Arena for Creatives`
- Sender email: (keep default or use custom)

**7.3 Copy Email Templates:**
- Open `email-templates/confirm-signup.html`
- Copy content
- Paste in "Confirm signup" template
- Click "Save"

Repeat for:
- `reset-password.html`
- `magic-link.html`
- `invite-user.html`
- `change-email.html`
- `reauthentication.html`

---

### **STEP 8: REDEPLOY APPLICATION**

**8.1 Trigger Deployment:**
```bash
# In your local project
git commit --allow-empty -m "Trigger redeploy with new Supabase"
git push
```

**8.2 Wait for Deployment:**
- Go to Vercel dashboard
- Watch deployment progress
- Wait for success ✅

---

### **STEP 9: TEST EVERYTHING**

**9.1 Test Authentication:**
- [ ] Sign up new account
- [ ] Check email received
- [ ] Confirm email
- [ ] Log in
- [ ] Log out
- [ ] Reset password

**9.2 Test Core Features:**
- [ ] View contests
- [ ] Submit entry
- [ ] Upload image
- [ ] Vote on entry
- [ ] Leave comment
- [ ] React to entry
- [ ] Share entry
- [ ] Check XP awarded

**9.3 Test Profile:**
- [ ] Update avatar
- [ ] Update cover photo
- [ ] Update bio
- [ ] Check level/XP display

---

### **STEP 10: UPDATE LOCAL DEVELOPMENT**

**10.1 Update `.env.local`:**
```bash
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**10.2 Test Locally:**
```bash
npm run dev
```

**10.3 Verify:**
- Sign up works
- Features work
- No console errors

---

## **✅ MIGRATION COMPLETE!**

Your AFC app is now running on the new paid Supabase project!

---

## **📊 POST-MIGRATION CHECKLIST**

- [ ] All database tables created
- [ ] RLS policies enabled
- [ ] Storage buckets configured
- [ ] Email templates branded
- [ ] Vercel env vars updated
- [ ] App redeployed
- [ ] Authentication tested
- [ ] Core features tested
- [ ] Local dev updated
- [ ] Old project can be deleted (after 1 week)

---

## **🔧 TROUBLESHOOTING**

### **Issue: "relation does not exist"**
**Solution:** Re-run schema script (01-schema.sql)

### **Issue: "permission denied"**
**Solution:** Check RLS policies (02-rls-policies.sql)

### **Issue: "function does not exist"**
**Solution:** Re-run functions script (03-functions.sql)

### **Issue: "Storage bucket not found"**
**Solution:** Create buckets manually in Dashboard → Storage

### **Issue: "Invalid API key"**
**Solution:** Double-check Vercel env vars match new project

### **Issue: "CORS error"**
**Solution:** Verify Supabase URL is correct in env vars

---

## **📞 NEED HELP?**

If you get stuck:
1. Check Supabase logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments → Logs
3. Check browser console for errors
4. Verify all env vars are correct

---

## **⏱️ ESTIMATED TIME**

- **Setup new project:** 5 minutes
- **Run database scripts:** 10 minutes
- **Configure storage:** 10 minutes
- **Update env vars:** 5 minutes
- **Redeploy:** 5 minutes
- **Testing:** 15 minutes
- **Total:** ~50 minutes

---

**Good luck with your migration!** 🚀
