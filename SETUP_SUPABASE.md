# Supabase Setup Guide for Bosomtwi Web

## Critical: Run this SQL in your Supabase Project

**⚠️ IMPORTANT:** Copy the entire contents of `supabase/schema.sql` and run it in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy ALL content from `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run**

## Verifying the Setup

### 1. Check Users Table Exists
```sql
SELECT * FROM public.users LIMIT 1;
```

### 2. Check RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname='public' AND tablename='users';
```

You should see:
- "Users can insert their own profile"
- "Authenticated users can select users"
- "Users can update their own profile"

### 3. Create an Admin User (Optional - for testing)

If you want to manually create an admin user:

```sql
INSERT INTO public.users (id, email, name, role, created_at) 
VALUES (
  'your-auth-user-id-here', 
  'admin@bosomtwi.com', 
  'Admin User', 
  'admin', 
  now()
);
```

Replace `your-auth-user-id-here` with the actual user ID from your Supabase Auth users.

## Login Flow

After setup:

1. Log in with your Supabase Auth credentials (email + password)
2. The app will automatically:
   - Check if user profile exists in `users` table
   - If not, create a profile with:
     - `role: 'admin'` if email is `admin@bosomtwi.com`
     - `role: 'journalist'` otherwise
3. Admin users can access all dashboard features

## Troubleshooting

### "Failed to create user profile" Error

**Possible causes:**

1. **Schema not applied**: Run the SQL from `supabase/schema.sql`
2. **RLS policies blocking**: Make sure all three policies are created
3. **Users table missing**: Check table exists: `SELECT * FROM information_schema.tables WHERE table_name='users';`

### Test Login with Admin

Email: `admin@bosomtwi.com`
(Use whatever password you set during Supabase Auth setup)

## Admin Features Now Available

After successful admin login:

✅ **Articles Tab**: View all published articles with edit/delete options
✅ **Analytics Tab**: Daily, weekly, monthly reports with view counts
✅ **Authors Tab**: Add new authors (admin-only form)
✅ **Settings Tab**: Configure site title and theme color

## Next Steps

1. Run the schema SQL
2. Try logging in with your admin email
3. All dashboard features should now work
