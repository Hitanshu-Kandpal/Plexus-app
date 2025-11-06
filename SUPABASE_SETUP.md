# Supabase Setup Guide for Plexus Recommendations

## Overview
This guide explains what you need to set up in Supabase to support personalized recommendations and user search history.

## Required Tables

### 1. `search_history` Table
This table stores user search queries and AI insights for recommendations.

**SQL to create the table:**
```sql
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('movie', 'music', 'book')),
  query TEXT NOT NULL,
  ai_insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);
```

### 2. (Optional) `favorites` Table
For storing user favorites/bookmarks of recommended items.

**SQL to create the table:**
```sql
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('movie', 'music', 'book')),
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_image TEXT,
  item_meta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_category ON public.favorites(category);
```

## Row Level Security (RLS) Policies

### For `search_history` Table

**Enable RLS:**
```sql
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
```

**Policy: Users can only see their own search history**
```sql
CREATE POLICY "Users can view their own search history"
  ON public.search_history
  FOR SELECT
  USING (true); -- Since we're using service role key, this allows all reads
  -- If using user auth, change to: USING (user_id = auth.uid()::text);
```

**Policy: Users can insert their own search history**
```sql
CREATE POLICY "Users can insert their own search history"
  ON public.search_history
  FOR INSERT
  WITH CHECK (true); -- Service role key bypasses this, but good for future
  -- If using user auth: WITH CHECK (user_id = auth.uid()::text);
```

### For `favorites` Table (if created)

**Enable RLS:**
```sql
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
```

**Policy: Users can manage their own favorites**
```sql
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (true); -- Service role key allows all

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (true);
```

## Important Notes

1. **Service Role Key**: Your recommender backend uses the `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS policies. This is fine for server-side operations, but be careful not to expose this key in client-side code.

2. **User ID Format**: The `user_id` column is `TEXT` because it stores MongoDB ObjectIds from your main MERN backend. Make sure the format matches what your backend sends.

3. **Testing**: After creating tables, test by:
   - Running a recommendation search from your app
   - Checking Supabase dashboard → Table Editor → `search_history` to see if rows are inserted

4. **Future Enhancements**:
   - Add a `recommendations` table to store cached recommendations per user
   - Add analytics tables for tracking popular searches
   - Implement user preferences table for better personalization

## Environment Variables

Make sure your `plexus-recommender-hub/server/.env` has:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these in your Supabase project settings → API.

## Verification Steps

1. ✅ Create `search_history` table
2. ✅ Enable RLS on `search_history`
3. ✅ Create policies (or use service role key)
4. ✅ Test by making a recommendation request from your app
5. ✅ Check Supabase dashboard to verify data is being inserted

