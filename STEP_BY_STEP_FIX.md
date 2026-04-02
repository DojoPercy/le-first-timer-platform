# Step-by-Step Database Troubleshooting

## 🔍 DIAGNOSE THE EXACT ISSUE

Let's find out exactly what's wrong with your database setup:

### **Step 1: Test Database Connection**

Open your browser and go to:
```
http://localhost:3000/api/test-db
```

This will tell us exactly what's wrong. Look at the response in your browser.

### **Step 2: Check the Response**

The test will return one of these:

#### **If you see "first_timers table does not exist":**
✅ **Solution**: Run the DATABASE_SETUP.sql script

#### **If you see "Connection failed":**
✅ **Solution**: Check your Supabase URL and API key

#### **If you see "Environment variables missing":**
✅ **Solution**: Add missing variables to `.env` file

#### **If you see "All database tests passed":**
✅ **Great!** The issue is elsewhere - check browser console for other errors

---

## 🛠️ DETAILED FIX STEPS

### **Option A: If Table Doesn't Exist**

1. **Go to Supabase Dashboard**
2. **Click "SQL Editor"** in left sidebar
3. **Copy this entire script**:

```sql
-- Quick fix for first_timers table
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

-- Enable RLS
ALTER TABLE first_timers ENABLE ROW LEVEL SECURITY;

-- Basic policy for testing
CREATE POLICY "First timers are viewable by authenticated users" ON first_timers FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO first_timers (full_name, contact, place_of_residence, invited_by, cell_name, visit_type, followup_outcome_status) VALUES 
  ('Test User 1', '233241234567', 'Accra', 'Jane Smith', 'Cell A', 'JOINING', 'pending'),
  ('Test User 2', '233242345678', 'Kumasi', 'Peter Brown', 'Cell B', 'VISITING', 'still_deciding');

SELECT 'first_timers table created successfully' as result;
```

4. **Click "Run"**
5. **Test again** at `http://localhost:3000/api/test-db`

### **Option B: If Connection Fails**

1. **Check your `.env` file**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Verify the URL format**:
   - Should start with `https://`
   - Should end with `.supabase.co`
   - No trailing slash

3. **Restart your server**:
```bash
npm run dev
```

### **Option C: If Environment Variables Missing**

1. **Open `.env` file**
2. **Add these lines**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
ARKESEL_API_KEY=your_arkesel_api_key
ARKESEL_SENDER_ID=YourChurchName
```

3. **Replace with actual values** from your Supabase dashboard

4. **Restart server**: `npm run dev`

---

## 🧪 VERIFICATION

After running the test API, you should see:

```json
{
  "success": true,
  "message": "All database tests passed",
  "data": {
    "firstTimersCount": 2,
    "sampleData": [...],
    "environment": {
      "NEXT_PUBLIC_SUPABASE_URL": "✅ Set",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "✅ Set",
      "ARKESEL_API_KEY": "✅ Set",
      "ARKESEL_SENDER_ID": "✅ Set"
    }
  }
}
```

---

## 🚀 NEXT STEPS

1. **Run the test**: `http://localhost:3000/api/test-db`
2. **Read the response**: See what specific error you get
3. **Apply the fix**: Follow the corresponding solution above
4. **Test again**: Keep testing until you get "success: true"
5. **Try the platform**: Login and test PDF generation

This step-by-step approach will identify exactly what's wrong and guide you to the specific fix needed!
