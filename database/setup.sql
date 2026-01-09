-- Database Setup Script for Orbyt CRM
-- Run this in your Supabase SQL Editor to set up the database

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- Step 2.5: Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create businesses table first (no circular reference)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    category VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'starter',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) UNIQUE,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'owner',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    service VARCHAR(255),
    date DATE,
    time TIME,
    status VARCHAR(50) DEFAULT 'pending',
    address TEXT,
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 6: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON businesses FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own businesses" ON businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own businesses" ON businesses FOR UPDATE USING (auth.uid() = owner_id);

-- Bookings policies
CREATE POLICY "Users can view bookings for own businesses" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = bookings.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Users can create bookings for own businesses" ON bookings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = bookings.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Users can update bookings for own businesses" ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM businesses WHERE businesses.id = bookings.business_id AND businesses.owner_id = auth.uid())
);

-- Step 8: Create functions and triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create function to handle new user signup (only for tracking, not creating profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Don't create profile automatically - wait for onboarding completion
    -- Just update metadata to track signup stage
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{signup_stage}',
        '"pending_onboarding"'::jsonb
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON businesses TO anon;
GRANT SELECT ON bookings TO anon;

-- Setup complete! You can now test the signup and onboarding flow.
