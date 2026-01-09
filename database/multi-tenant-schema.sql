-- Enhanced Multi-Tenant SaaS Schema
-- This script adds additional security and isolation for SaaS multi-tenancy

-- Step 1: Add additional columns for better multi-tenancy
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT uuid_generate_v4() UNIQUE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'owner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Step 2: Create tenant users table for team management
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    permissions JSONB DEFAULT '{}', -- Granular permissions
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_id, user_id)
);

-- Step 3: Create audit log for security
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enhanced RLS Policies for better multi-tenancy

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can create own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update own businesses" ON businesses;

DROP POLICY IF EXISTS "Users can view bookings for own businesses" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings for own businesses" ON bookings;
DROP POLICY IF EXISTS "Users can update bookings for own businesses" ON bookings;

-- Enhanced Profiles Policies
CREATE POLICY "Users can view own business profiles" ON profiles FOR SELECT USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
    )
);

CREATE POLICY "Users can update own business profiles" ON profiles FOR UPDATE USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
    )
);

CREATE POLICY "Users can insert own business profiles" ON profiles FOR INSERT WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

-- Enhanced Businesses Policies
CREATE POLICY "Users can view own businesses" ON businesses FOR SELECT USING (
    owner_id = auth.uid() OR id IN (
        SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
    )
);

CREATE POLICY "Users can create own businesses" ON businesses FOR INSERT WITH CHECK (
    owner_id = auth.uid()
);

CREATE POLICY "Users can update own businesses" ON businesses FOR UPDATE USING (
    owner_id = auth.uid() OR id IN (
        SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Enhanced Bookings Policies
CREATE POLICY "Users can view bookings for accessible businesses" ON bookings FOR SELECT USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
    )
);

CREATE POLICY "Users can create bookings for accessible businesses" ON bookings FOR INSERT WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
    )
);

CREATE POLICY "Users can update bookings for accessible businesses" ON bookings FOR UPDATE USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
);

-- Tenant Users Policies
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage team members" ON tenant_users FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

CREATE POLICY "Team members can view their own access" ON tenant_users FOR SELECT USING (
    user_id = auth.uid()
);

-- Audit Logs Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business audit logs" ON audit_logs FOR SELECT USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid() OR id IN (
            SELECT business_id FROM tenant_users WHERE user_id = auth.uid() AND is_active = true
        )
    )
);

-- Step 5: Functions for tenant management

-- Function to get current user's accessible businesses
CREATE OR REPLACE FUNCTION get_user_businesses()
RETURNS TABLE(id UUID, name VARCHAR, role VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id, 
        b.name,
        CASE 
            WHEN b.owner_id = auth.uid() THEN 'owner'
            ELSE tu.role
        END as role
    FROM businesses b
    LEFT JOIN tenant_users tu ON b.id = tu.business_id AND tu.user_id = auth.uid() AND tu.is_active = true
    WHERE b.owner_id = auth.uid() OR tu.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(business_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    is_owner BOOLEAN;
BEGIN
    -- Check if user is business owner
    SELECT owner_id = auth.uid() INTO is_owner FROM businesses WHERE id = business_uuid;
    
    IF is_owner THEN
        RETURN TRUE;
    END IF;
    
    -- Check team member permissions
    SELECT role INTO user_role 
    FROM tenant_users 
    WHERE business_id = business_uuid AND user_id = auth.uid() AND is_active = true;
    
    IF user_role = 'admin' THEN
        RETURN TRUE;
    ELSIF user_role = 'member' THEN
        -- Check specific permissions in JSONB
        RETURN EXISTS (
            SELECT 1 FROM tenant_users 
            WHERE business_id = business_uuid 
                AND user_id = auth.uid() 
                AND is_active = true
                AND permissions::jsonb ? required_permission
        );
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (business_id, user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        COALESCE(NEW.business_id, OLD.business_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_businesses AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_tenant_users AFTER INSERT OR UPDATE OR DELETE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Step 7: Update timestamp triggers for new tables
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_tenant_id ON businesses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_business_id ON profiles(business_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_business_id ON tenant_users(business_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Step 9: Grant permissions
GRANT ALL ON tenant_users TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_businesses() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(UUID, TEXT) TO authenticated;

-- Multi-tenant setup complete!
-- Each user is now isolated to their own business data
-- Team members can be invited with specific roles and permissions
-- All actions are audited for security
