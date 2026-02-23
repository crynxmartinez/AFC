# Property Name Mismatch Solution

## Problem
- Prisma schema uses camelCase (e.g., `startDate`, `avatarUrl`)
- Prisma returns camelCase in API responses
- Frontend types expect snake_case (e.g., `start_date`, `avatar_url`)
- This causes runtime errors where data appears blank

## Solution Options

### Option A: Update All Frontend Types to camelCase (MASSIVE WORK)
- Update type definitions in 34 pages
- Update 67+ property references across codebase
- High risk of missing references
- Estimated time: 4-6 hours

### Option B: Transform API Responses to snake_case (FASTER)
- Add response transformer to API client
- Converts camelCase to snake_case automatically
- No frontend code changes needed
- Estimated time: 30 minutes

### Option C: Keep Prisma Responses as-is, Update Frontend Gradually
- Accept some runtime errors initially
- Fix pages one by one as needed
- Lower priority since build is passing

## Recommendation: Option B
Add a response transformer to the API client that converts all camelCase properties to snake_case before returning to frontend.

## Implementation
See `src/lib/api.ts` - add `transformResponse` helper function.
