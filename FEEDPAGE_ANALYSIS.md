# FeedPage.tsx - Supabase Usage Analysis

## Supabase Queries Found (Line by Line)

### Line 68-72: `fetchFollowingCount()`
```typescript
const { count } = await supabase
  .from('follows')
  .select('*', { count: 'exact', head: true })
  .eq('follower_id', user.id)
```
**Migration:** Use existing API endpoint `/api/users/${userId}/following` and count the results

### Line 81-87: Get finalized contests
```typescript
const { data: contests } = await supabase
  .from('contests')
  .select('id, title, finalized_at')
  .eq('prize_pool_distributed', true)
  .gte('finalized_at', sevenDaysAgo.toISOString())
  .order('finalized_at', { ascending: false })
  .limit(3)
```
**Migration:** Need new API endpoint `/api/contests/winners/recent` or use `/api/contests?status=finalized`

### Line 97-106: Get contest winners
```typescript
const { data: winners } = await supabase
  .from('contest_winners')
  .select(`
    placement,
    prize_amount,
    users:user_id (username, avatar_url),
    entries:entry_id (phase_4_url)
  `)
  .eq('contest_id', contest.id)
  .order('placement', { ascending: true })
```
**Migration:** Need new API endpoint `/api/contests/${contestId}/winners`

### Line 134-137: Get following users
```typescript
const { data: followingData } = await supabase
  .from('follows')
  .select('following_id')
  .eq('follower_id', user.id)
```
**Migration:** Use `/api/users/${userId}/following`

### Line 143-169: Get feed entries
```typescript
let query = supabase
  .from('entries')
  .select('id, title, description, phase_4_url, created_at, last_activity_at, user_id, contest_id, status')
  .eq('status', 'approved')
  // + filters for time range and following
  .order(sortField, { ascending: false })
  .limit(50)
```
**Migration:** Use existing `/api/feed?filter=${filter}&timeRange=${timeRange}` endpoint

### Line 176-181: Get entry related data
```typescript
const [{ data: userData }, { data: contestData }, { count: voteCount }, { count: commentCount }] = await Promise.all([
  supabase.from('users').select('username, avatar_url').eq('id', entry.user_id).single(),
  supabase.from('contests').select('title, status').eq('id', entry.contest_id).single(),
  supabase.from('reactions').select('*', { count: 'exact', head: true }).eq('entry_id', entry.id),
  supabase.from('entry_comments').select('*', { count: 'exact', head: true }).eq('entry_id', entry.id)
])
```
**Migration:** The `/api/feed` endpoint should already include this data in the response

## Required API Endpoints

### ✅ Already Exists:
- `/api/feed?filter=latest|popular|following&timeRange=7|30|90|365` - Main feed endpoint
- `/api/users/${userId}/following` - Get following list

### ❌ Need to Create:
- `/api/contests/winners/recent` - Get recently finalized contests with winners
- `/api/contests/${contestId}/winners` - Get winners for a specific contest

## Migration Plan for FeedPage.tsx

1. Create missing API endpoints for winners
2. Replace all Supabase calls with API calls
3. Update types to match API responses (camelCase)
4. Remove Supabase import
5. Test feed functionality
