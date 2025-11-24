# 📦 **MIGRATION PACKAGE**

Complete migration package for Arena for Creatives Supabase project.

---

## **📁 FILES INCLUDED**

### **Database Scripts:**
1. **`01-schema.sql`** - Complete database schema (tables, indexes)
2. **`02-rls-policies.sql`** - Row Level Security policies
3. **`03-functions.sql`** - Database functions
4. **`04-triggers.sql`** - Database triggers
5. **`05-xp-system.sql`** - XP and level configuration

### **Documentation:**
- **`MIGRATION_GUIDE.md`** - Step-by-step migration instructions
- **`README.md`** - This file

---

## **🚀 QUICK START**

### **Option 1: Fresh Start (No existing data)**
```
1. Create new Supabase project
2. Run scripts 01-05 in order
3. Configure storage buckets
4. Update Vercel env vars
5. Redeploy
6. Test
```

### **Option 2: With Data Migration**
```
1. Export data from old project
2. Create new Supabase project
3. Run scripts 01-05 in order
4. Import data
5. Configure storage buckets
6. Update Vercel env vars
7. Redeploy
8. Test
```

---

## **⚡ EXECUTION ORDER**

**CRITICAL:** Run scripts in this exact order:

```
1. 01-schema.sql          ← Tables and indexes
2. 02-rls-policies.sql    ← Security policies
3. 03-functions.sql       ← Database functions
4. 04-triggers.sql        ← Automated triggers
5. 05-xp-system.sql       ← XP configuration
```

---

## **📊 WHAT'S INCLUDED**

### **Database Tables:**
- ✅ users (with XP system)
- ✅ contests
- ✅ entries
- ✅ votes
- ✅ comments
- ✅ reactions
- ✅ shares
- ✅ xp_transactions
- ✅ achievements
- ✅ user_achievements
- ✅ notifications
- ✅ user_stats
- ✅ level_config
- ✅ xp_rewards

### **Storage Buckets:**
- ✅ avatars
- ✅ entries
- ✅ contests
- ✅ cover-photos

### **Functions:**
- ✅ award_xp()
- ✅ get_level_progress()
- ✅ update_user_share_stats()
- ✅ increment/decrement counters
- ✅ update_user_activity()

### **Triggers:**
- ✅ Auto-update vote counts
- ✅ Auto-update comment counts
- ✅ Auto-update share counts
- ✅ Auto-track user activity

### **XP System:**
- ✅ 100 levels configured
- ✅ XP rewards for all actions
- ✅ Level titles (Beginner → Legend)
- ✅ Linear progression (100 XP per level)

---

## **⏱️ ESTIMATED TIME**

**Fresh migration:** ~50 minutes
**With data migration:** ~2 hours

---

## **✅ CHECKLIST**

Before starting:
- [ ] New Supabase project created
- [ ] Database password saved
- [ ] Vercel access ready
- [ ] Old project backed up (optional)

After migration:
- [ ] All scripts executed successfully
- [ ] Storage buckets created
- [ ] Storage policies configured
- [ ] Email templates updated
- [ ] Vercel env vars updated
- [ ] App redeployed
- [ ] Authentication tested
- [ ] Features tested

---

## **🔧 TROUBLESHOOTING**

**Script fails?**
- Check for syntax errors
- Verify previous scripts ran successfully
- Check Supabase logs

**RLS issues?**
- Re-run 02-rls-policies.sql
- Check policies in Dashboard

**Functions missing?**
- Re-run 03-functions.sql
- Verify in Dashboard → Database → Functions

**Triggers not working?**
- Re-run 04-triggers.sql
- Check in Dashboard → Database → Triggers

---

## **📞 SUPPORT**

If you encounter issues:
1. Read MIGRATION_GUIDE.md carefully
2. Check Supabase Dashboard → Logs
3. Check Vercel Deployment logs
4. Verify all env vars are correct

---

## **🎯 NEXT STEPS**

After successful migration:
1. ✅ Test all features thoroughly
2. ✅ Monitor for errors (first 24 hours)
3. ✅ Update local development environment
4. ✅ Keep old project for 1 week (backup)
5. ✅ Delete old project after verification

---

**Ready to migrate? Open MIGRATION_GUIDE.md and follow the steps!** 🚀
