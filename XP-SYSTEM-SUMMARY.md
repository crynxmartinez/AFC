# 🎮 XP & Level System - Complete Implementation

## ✅ **STEP 1: Run Database Migration**

**File:** `supabase-xp-system-migration.sql`

This creates:
- ✅ 100 levels with linear XP progression (0, 100, 200, 300...)
- ✅ Default XP rewards for all actions
- ✅ Default level rewards (points, badges, multipliers)
- ✅ XP history tracking
- ✅ Badge system
- ✅ Automatic level-up functions

---

## 📊 **Default Configuration**

### **Levels (1-100):**
```
Level 1:  0 XP     - Beginner
Level 2:  100 XP   - Beginner
Level 3:  200 XP   - Beginner
Level 5:  400 XP   - Apprentice
Level 10: 900 XP   - Artist
Level 20: 1,900 XP - Expert Artist
Level 30: 2,900 XP - Master Artist
Level 50: 4,900 XP - Legend
```

### **XP Rewards:**
```
Submit Entry:     +50 XP
Get Reaction:     +5 XP
Get Comment:      +10 XP
Leave Comment:    +3 XP
Win 1st Place:    +200 XP
Win 2nd Place:    +150 XP
Win 3rd Place:    +100 XP
Daily Login:      +10 XP
Complete Profile: +25 XP (one-time)
Follow User:      +2 XP
Get Followed:     +5 XP
```

### **Level Rewards:**
```
Level 5:  +50 points, Novice Artist Badge 🎨
Level 10: +100 points, Rising Star Badge ⭐, +10% XP Bonus
Level 15: +150 points
Level 20: +250 points, +20% XP Bonus
Level 25: +500 points, Master Artist Badge 👑
Level 30: +30% XP Bonus
Level 50: +2000 points, Legend Badge 💎, +50% XP Bonus
```

---

## 🔧 **How to Use**

### **Award XP (Backend):**
```sql
-- Award XP for submitting entry
SELECT * FROM award_xp(
  'user-uuid',           -- User ID
  'submit_entry',        -- Action type
  'entry-uuid',          -- Reference ID (optional)
  'Submitted art entry'  -- Description (optional)
);

-- Returns:
-- xp_gained: 50
-- new_total_xp: 150
-- new_level: 2
-- leveled_up: true
```

### **Get User Progress:**
```sql
SELECT * FROM get_level_progress('user-uuid');

-- Returns:
-- current_level: 2
-- current_xp: 150
-- current_level_xp: 100
-- next_level_xp: 200
-- xp_to_next_level: 50
-- progress_percentage: 50
```

---

## 🎯 **Next Steps**

### **Phase 2: Auto-Award XP**
Trigger XP awards automatically when:
- User submits entry
- User gets reaction
- User gets comment
- Contest ends (award winners)

### **Phase 3: Admin Dashboard**
Create admin pages to:
- View/edit level config
- View/edit XP rewards
- View/edit level rewards
- View statistics

### **Phase 4: User Interface**
Add to UI:
- XP progress bar in sidebar
- Level-up notifications
- Badge display on profile
- XP history page

---

## 📝 **Admin Control**

You can modify everything in the database:

### **Change XP for Actions:**
```sql
UPDATE xp_rewards
SET xp_amount = 100
WHERE action_type = 'submit_entry';
```

### **Add New Level:**
```sql
INSERT INTO level_config (level, xp_required, title)
VALUES (101, 10000, 'Ultimate Legend');
```

### **Add New Reward:**
```sql
INSERT INTO level_rewards (level, reward_type, reward_value, description)
VALUES (100, 'points', '10000', 'Reached max level!');
```

### **Disable an Action:**
```sql
UPDATE xp_rewards
SET enabled = false
WHERE action_type = 'daily_login';
```

---

## 🏆 **Badge System**

### **Default Badges:**
- 🎨 **Novice Artist** (Level 5)
- ⭐ **Rising Star** (Level 10)
- 👑 **Master Artist** (Level 25)
- 💎 **Legend** (Level 50)

### **Add Custom Badge:**
```sql
INSERT INTO level_rewards (level, reward_type, reward_value, description)
VALUES (15, 'badge', 'contest_master', 'Contest Master Badge 🏆');
```

---

## 📈 **Statistics Queries**

### **Top XP Earners:**
```sql
SELECT username, level, xp
FROM users
ORDER BY xp DESC
LIMIT 10;
```

### **Level Distribution:**
```sql
SELECT 
  CASE 
    WHEN level <= 5 THEN '1-5'
    WHEN level <= 10 THEN '6-10'
    WHEN level <= 20 THEN '11-20'
    ELSE '21+'
  END as level_range,
  COUNT(*) as user_count
FROM users
GROUP BY level_range;
```

### **XP Earned Today:**
```sql
SELECT SUM(xp_gained) as total_xp
FROM xp_history
WHERE created_at >= CURRENT_DATE;
```

---

## 🎮 **Gamification Features**

### **Implemented:**
- ✅ XP earning system
- ✅ Level progression
- ✅ Automatic level-up
- ✅ Level rewards (points, badges, multipliers)
- ✅ XP history tracking
- ✅ Badge system

### **Coming Soon:**
- Daily challenges
- Achievements
- Leaderboards
- Streaks
- Seasonal events

---

**Status:** Database ready! Run the SQL migration to activate the system! 🚀
