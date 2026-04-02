-- TELEPASTORING PLATFORM DATABASE SETUP
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create callers table  
CREATE TABLE IF NOT EXISTS callers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'caller' CHECK (role IN ('super_admin', 'admin', 'caller')),
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  active_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create first_timers table
CREATE TABLE IF NOT EXISTS first_timers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  form_submitted_at TIMESTAMP WITH TIME ZONE,
  submitter_email TEXT,
  contact TEXT,
  place_of_residence TEXT,
  invited_by TEXT,
  cell_name TEXT,
  visit_type TEXT CHECK (visit_type IN ('JOINING', 'VISITING')),
  followup_outcome_status TEXT DEFAULT 'pending' CHECK (followup_outcome_status IN ('pending', 'still_deciding', 'fully_joined', 'not_continuing')),
  joined_confirmed_at TIMESTAMP WITH TIME ZONE,
  outcome_updated_at TIMESTAMP WITH TIME ZONE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  assigned_caller_id UUID REFERENCES callers(id) ON DELETE SET NULL,
  last_followup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create followups table
CREATE TABLE IF NOT EXISTS followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_timer_id UUID REFERENCES first_timers(id) ON DELETE CASCADE,
  caller_id UUID REFERENCES callers(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Contacted', 'Pending', 'Not Reachable')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branch_integrations table
CREATE TABLE IF NOT EXISTS branch_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  integration_type TEXT DEFAULT 'first_timer_intake',
  provider TEXT,
  sheet_id TEXT,
  sheet_range TEXT,
  form_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  template_version INTEGER DEFAULT 1,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE callers ENABLE ROW LEVEL SECURITY;
ALTER TABLE first_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_integrations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_callers_user_id ON callers(user_id);
CREATE INDEX IF NOT EXISTS idx_callers_branch_id ON callers(branch_id);
CREATE INDEX IF NOT EXISTS idx_callers_role ON callers(role);
CREATE INDEX IF NOT EXISTS idx_first_timers_branch_id ON first_timers(branch_id);
CREATE INDEX IF NOT EXISTS idx_first_timers_assigned_caller_id ON first_timers(assigned_caller_id);
CREATE INDEX IF NOT EXISTS idx_first_timers_followup_outcome_status ON first_timers(followup_outcome_status);
CREATE INDEX IF NOT EXISTS idx_first_timers_created_at ON first_timers(created_at);
CREATE INDEX IF NOT EXISTS idx_followups_first_timer_id ON followups(first_timer_id);
CREATE INDEX IF NOT EXISTS idx_followups_caller_id ON followups(caller_id);
CREATE INDEX IF NOT EXISTS idx_followups_branch_id ON followups(branch_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_branch_integrations_branch_id ON branch_integrations(branch_id);

-- RLS Policies for branches
CREATE POLICY "Branches are viewable by authenticated users" ON branches FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Branches are insertable by super_admins" ON branches FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
  SELECT 1 FROM callers WHERE user_id = auth.uid() AND role = 'super_admin'
));
CREATE POLICY "Branches are updatable by super_admins" ON branches FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
  SELECT 1 FROM callers WHERE user_id = auth.uid() AND role = 'super_admin'
));

-- RLS Policies for callers
CREATE POLICY "Callers are viewable by authenticated users" ON callers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Callers are manageable by admins" ON callers FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM callers 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
CREATE POLICY "Callers can view their own profile" ON callers FOR SELECT USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- RLS Policies for first_timers
CREATE POLICY "First timers are viewable by authenticated users" ON first_timers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "First timers are manageable by admins" ON first_timers FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM callers 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
CREATE POLICY "Callers can view assigned first timers" ON first_timers FOR SELECT USING (
  auth.role() = 'authenticated' AND assigned_caller_id IN (
    SELECT id FROM callers WHERE user_id = auth.uid()
  )
);

-- RLS Policies for followups
CREATE POLICY "Followups are viewable by authenticated users" ON followups FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Followups are manageable by admins" ON followups FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM callers 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
CREATE POLICY "Callers can manage their followups" ON followups FOR ALL USING (
  auth.role() = 'authenticated' AND caller_id IN (
    SELECT id FROM callers WHERE user_id = auth.uid()
  )
);

-- RLS Policies for branch_integrations
CREATE POLICY "Branch integrations are viewable by authenticated users" ON branch_integrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Branch integrations are manageable by admins" ON branch_integrations FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM callers 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Insert sample data for testing
INSERT INTO branches (name, slug, code, status, description) VALUES 
  ('Main Branch', 'main', 'MAIN001', 'active', 'Primary church location')
ON CONFLICT (slug) DO NOTHING;

-- Create a super admin user (you'll need to create this user through auth first)
-- This assumes you have a user with email 'admin@church.com'
-- You can modify this email to match your actual admin user

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_callers_updated_at BEFORE UPDATE ON callers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_first_timers_updated_at BEFORE UPDATE ON first_timers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branch_integrations_updated_at BEFORE UPDATE ON branch_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample first timer data for testing
INSERT INTO first_timers (full_name, contact, place_of_residence, invited_by, cell_name, visit_type, followup_outcome_status, branch_id) VALUES 
  ('John Doe', '233241234567', 'Accra', 'Jane Smith', 'Cell A', 'JOINING', 'pending', (SELECT id FROM branches WHERE slug = 'main')),
  ('Mary Johnson', '233242345678', 'Kumasi', 'Peter Brown', 'Cell B', 'VISITING', 'still_deciding', (SELECT id FROM branches WHERE slug = 'main')),
  ('David Wilson', '233243456789', 'Tema', 'Sarah Davis', 'Cell A', 'JOINING', 'fully_joined', (SELECT id FROM branches WHERE slug = 'main'))
ON CONFLICT DO NOTHING;

-- Sample caller data for testing
-- Note: These users need to exist in auth.users table first
-- You can create them through Supabase Auth or modify the emails

-- The database is now ready for use!
-- Make sure to create actual users through Supabase Auth before testing
