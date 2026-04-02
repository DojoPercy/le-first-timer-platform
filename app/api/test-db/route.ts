import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check if we can create Supabase client
    console.log('📡 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');
    
    // Test 2: Check if we can connect to Supabase at all
    console.log('🔗 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('branches')
      .select('count')
      .single();
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError,
        step: 'connection'
      });
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 3: Check if first_timers table exists
    console.log('📋 Checking first_timers table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('first_timers')
      .select('count')
      .single();
    
    if (tableError) {
      console.error('❌ Table check failed:', tableError);
      
      // Check if it's a "relation does not exist" error
      if (tableError.message?.includes('does not exist') || tableError.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'first_timers table does not exist',
          details: 'You need to run the DATABASE_SETUP.sql script',
          step: 'table_missing',
          fix: 'Run the DATABASE_SETUP.sql script in Supabase SQL Editor'
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Table access failed',
        details: tableError,
        step: 'table_access'
      });
    }
    
    console.log('✅ first_timers table exists');
    
    // Test 4: Try to fetch actual data
    console.log('📊 Fetching first timers data...');
    const { data: firstTimers, error: fetchError } = await supabase
      .from('first_timers')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Data fetch failed:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Data fetch failed',
        details: fetchError,
        step: 'data_fetch'
      });
    }
    
    console.log(`✅ Successfully fetched ${firstTimers?.length || 0} first timers`);
    
    // Test 5: Check environment variables
    console.log('🔧 Checking environment variables...');
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      ARKESEL_API_KEY: process.env.ARKESEL_API_KEY ? '✅ Set' : '❌ Missing',
      ARKESEL_SENDER_ID: process.env.ARKESEL_SENDER_ID ? '✅ Set' : '❌ Missing'
    };
    
    console.log('📋 Environment variables:', envVars);
    
    return NextResponse.json({
      success: true,
      message: 'All database tests passed',
      data: {
        firstTimersCount: firstTimers?.length || 0,
        sampleData: firstTimers?.slice(0, 2) || [],
        environment: envVars,
        connectionTest: connectionTest,
        tableCheck: tableCheck
      }
    });
    
  } catch (error) {
    console.error('🚨 Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'general_error'
    });
  }
}
