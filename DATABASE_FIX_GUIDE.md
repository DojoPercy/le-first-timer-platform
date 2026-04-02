# Database Setup Guide

## Quick Fix for "Failed to fetch first timers data"

This error occurs because the `first_timers` table doesn't exist in your Supabase database. Here's how to fix it:

## 🚀 IMMEDIATE STEPS

### 1. Run the Database Setup

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Copy and paste** the entire contents of `DATABASE_SETUP.sql`
4. **Click "Run"** to execute the SQL

### 2. Create Test Users

After running the SQL, create test users:

1. **Go to Authentication** → **Users** in Supabase
2. **Create these users** (or modify with your actual emails):
   - `admin@church.com` (Super Admin)
   - `caller@church.com` (Caller)
   - `test@church.com` (Test user)

### 3. Add Environment Variables

Make sure your `.env` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ARKESEL_API_KEY=your_api_key_here
ARKESEL_SENDER_ID=YourChurchName
```

### 4. Restart Your Server

```bash
npm run dev
```

## 📋 WHAT THE SETUP CREATES

### Database Tables:
- ✅ **branches** - Church locations
- ✅ **callers** - User accounts and roles
- ✅ **first_timers** - First timer data
- ✅ **followups** - Follow-up records
- ✅ **branch_integrations** - Google Sheets integration

### Security Features:
- ✅ **Row Level Security (RLS)** policies
- ✅ **User role permissions**
- ✅ **Data access controls**
- ✅ **Performance indexes**

### Sample Data:
- ✅ **Main branch** entry
- ✅ **Sample first timers** for testing
- ✅ **Updated triggers** for timestamps

## 🧪 TESTING THE FIX

1. **Access your platform**: Go to `http://localhost:3000`
2. **Login as admin**: Use `admin@church.com`
3. **Check dashboard**: Should show sample data
4. **Test PDF generation**: Try generating a report
5. **Test SMS messaging**: Try sending a test SMS

## 🔍 TROUBLESHOOTING

### If you still get "Failed to fetch first timers data":

1. **Check Supabase connection**:
   ```javascript
   // Test in browser console
   fetch('/api/test-db').then(r => r.json()).then(console.log)
   ```

2. **Verify table exists**:
   - Go to Supabase → Table Editor
   - Look for `first_timers` table
   - Should show sample data

3. **Check RLS policies**:
   - Go to Authentication → Policies
   - Verify policies exist for all tables

4. **Check user permissions**:
   - Ensure your user has correct role
   - Try logging out and back in

### Common Issues:

❌ **"Table doesn't exist"**
✅ **Run the DATABASE_SETUP.sql script**

❌ **"Permission denied"**
✅ **Check RLS policies and user roles**

❌ **"Connection failed"**
✅ **Verify Supabase URL and API key**

## 📱 NEXT STEPS AFTER SETUP

1. **Create real users** through Supabase Auth
2. **Add your church branches** to the branches table
3. **Import existing first timer data** if you have any
4. **Set up Google Sheets integration** for data import
5. **Configure Arkesel SMS** with real API credentials

## 🎯 SUCCESS INDICATORS

You'll know it's working when:

- ✅ Admin dashboard loads without errors
- ✅ Sample first timer data appears
- ✅ PDF reports generate successfully
- ✅ SMS messaging interface loads
- ✅ No "Failed to fetch" errors in console

## 🆘 NEED HELP?

If you're still having issues:

1. **Check the browser console** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Ensure Supabase project is active** and not paused
4. **Check that you ran the complete SQL script**

The database setup should resolve all "Failed to fetch" errors and get your Telepastoring Platform fully operational!
