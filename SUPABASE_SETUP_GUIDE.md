# Supabase Setup Guide

## Environment Variables Required

Add these to your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Supabase Credentials

1. **Go to Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project** or create a new one
3. **Go to Project Settings** → **API**
4. **Copy the Project URL** and **anon/public key**

## Database Tables Required

The following tables should exist in your Supabase database:

```sql
-- Branches table
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Callers table  
CREATE TABLE callers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'caller',
  branch_id UUID REFERENCES branches(id),
  active_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First timers table
CREATE TABLE first_timers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  form_submitted_at TIMESTAMP WITH TIME ZONE,
  submitter_email TEXT,
  contact TEXT,
  place_of_residence TEXT,
  invited_by TEXT,
  cell_name TEXT,
  visit_type TEXT, -- JOINING | VISITING | JOINING, VISITING
  followup_outcome_status TEXT DEFAULT 'pending', -- pending | still_deciding | fully_joined | not_continuing
  joined_confirmed_at TIMESTAMP WITH TIME ZONE,
  outcome_updated_at TIMESTAMP WITH TIME ZONE,
  branch_id UUID REFERENCES branches(id),
  assigned_caller_id UUID REFERENCES callers(id),
  last_followup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Followups table
CREATE TABLE followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_timer_id UUID REFERENCES first_timers(id),
  caller_id UUID REFERENCES callers(id),
  branch_id UUID REFERENCES branches(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending', -- Contacted | Pending | Not Reachable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch integrations table
CREATE TABLE branch_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id),
  integration_type TEXT DEFAULT 'first_timer_intake',
  provider TEXT,
  sheet_id TEXT,
  sheet_range TEXT,
  form_url TEXT,
  status TEXT DEFAULT 'active', -- active | paused | error
  template_version INTEGER DEFAULT 1,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

Add these RLS policies for security:

```sql
-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE callers ENABLE ROW LEVEL SECURITY;
ALTER TABLE first_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_integrations ENABLE ROW LEVEL SECURITY;

-- Branch policies
CREATE POLICY "Branches are viewable by everyone" ON branches FOR SELECT USING (true);
CREATE POLICY "Branches are insertable by authenticated users" ON branches FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Callers policies
CREATE POLICY "Callers are viewable by authenticated users" ON callers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Callers are manageable by admins" ON callers FOR ALL USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM callers 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
);

-- First timers policies
CREATE POLICY "First timers are viewable by authenticated users" ON first_timers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "First timers are manageable by admins" ON first_timers FOR ALL USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM callers 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
);

-- Followups policies
CREATE POLICY "Followups are viewable by authenticated users" ON followups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Followups are manageable by admins" ON followups FOR ALL USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM callers 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'caller')
    )
  )
);

-- Branch integrations policies
CREATE POLICY "Branch integrations are viewable by authenticated users" ON branch_integrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Branch integrations are manageable by admins" ON branch_integrations FOR ALL USING (
  auth.role() = 'authenticated' AND (
    EXISTS (
      SELECT 1 FROM callers 
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
);
```

## Troubleshooting "supabase.from is not a function"

### Common Causes:

1. **Missing environment variables**
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
   - Restart your development server after adding them

2. **Incorrect Supabase client initialization**
   - The server client should be awaited: `const supabase = await createClient()`
   - Client components should use: `createClient()` from `@/lib/supabase/client`

3. **Database connection issues**
   - Verify your Supabase project is active
   - Check that the URL and keys are correct
   - Ensure your database has the required tables

4. **Authentication issues**
   - Make sure RLS policies are set up correctly
   - Check that users are properly authenticated

### Debugging Steps:

1. **Check environment variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Test Supabase connection**:
   ```javascript
   import { createClient } from '@/lib/supabase/server'
   
   async function testConnection() {
     const supabase = await createClient();
     const { data, error } = await supabase.from('branches').select('count');
     console.log('Supabase test:', { data, error });
   }
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

4. **Check browser console** for any JavaScript errors

## Migration Script

If you need to create the tables, run this SQL in your Supabase SQL editor:

```sql
-- Create all required tables and policies
-- (Copy the SQL from above sections)

-- Insert sample data
INSERT INTO branches (name, slug, code, status) VALUES 
  ('Main Branch', 'main', 'MAIN001', 'active');

-- The tables are now ready for use!
```

## Next Steps

1. **Set up your Supabase project**
2. **Add environment variables** to `.env`
3. **Run the SQL migration** to create tables
4. **Restart your development server**
5. **Test the connection** by accessing the admin dashboard

Your Telepastoring Platform should now work correctly with Supabase!
