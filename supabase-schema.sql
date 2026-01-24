-- =====================================================
-- Solar Panel Webapp - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (stores additional user info beyond Clerk)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by clerk_user_id
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);

-- =====================================================
-- 2. ANALYSIS_HISTORY TABLE (stores both Plan and Improve analyses)
-- =====================================================
CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Clerk user ID
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('plan', 'improve')),

    -- Address Information
    address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Canada',

    -- Image Information
    image_url TEXT, -- Supabase Storage URL
    image_data TEXT, -- Base64 encoded image (fallback)

    -- Roof Analysis Results
    roof_area_sq_meters DECIMAL(10, 2),
    shading_level TEXT CHECK (shading_level IN ('low', 'medium', 'high')),
    roof_pitch_degrees DECIMAL(5, 2),
    complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
    usable_area_percentage DECIMAL(5, 2),

    -- Solar Potential
    yearly_solar_potential_kwh DECIMAL(10, 2),
    average_irradiance_kwh_per_sqm DECIMAL(10, 2),
    optimal_panel_count INTEGER,
    peak_sun_hours_per_day DECIMAL(5, 2),

    -- Recommendations
    suitability_score DECIMAL(5, 2),
    system_size_kw DECIMAL(10, 2),
    panel_count INTEGER,
    estimated_annual_production_kwh DECIMAL(10, 2),
    estimated_production DECIMAL(10, 2), -- Alias for backward compatibility
    layout_suggestion TEXT,
    explanation TEXT,

    -- Financial Analysis
    estimated_cost_cad DECIMAL(12, 2),
    annual_savings_cad DECIMAL(10, 2),
    payback_period_years DECIMAL(5, 2),
    roi_25_years_cad DECIMAL(12, 2),

    -- Improve Feature Specific
    current_efficiency_percentage DECIMAL(5, 2), -- For Improve feature
    potential_efficiency_percentage DECIMAL(5, 2), -- For Improve feature
    improvement_suggestions JSONB, -- Array of improvement suggestions

    -- Additional Data
    monthly_bill DECIMAL(10, 2),
    ai_summary TEXT,
    raw_analysis_data JSONB, -- Store complete API response

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_user_created ON analysis_history(user_id, created_at DESC);

-- =====================================================
-- 3. GENERATED_IMAGES TABLE (stores AI-generated visualization images)
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analysis_history(id) ON DELETE CASCADE,
    view_type TEXT NOT NULL CHECK (view_type IN ('aerial', 'south', 'west', 'all')),
    image_url TEXT, -- Supabase Storage URL
    image_data TEXT, -- Base64 encoded image
    prompt_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by analysis_id
CREATE INDEX IF NOT EXISTS idx_generated_images_analysis ON generated_images(analysis_id);

-- =====================================================
-- 4. IMPROVEMENT_SUGGESTIONS TABLE (detailed improvement tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS improvement_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analysis_history(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL, -- 'repositioning', 'cleaning', 'additional_panels', 'tree_trimming', etc.
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_efficiency_gain DECIMAL(5, 2), -- Percentage
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
    estimated_cost_cad DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by analysis_id
CREATE INDEX IF NOT EXISTS idx_suggestions_analysis ON improvement_suggestions(analysis_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Analysis history policies
CREATE POLICY "Users can view their own analyses"
    ON analysis_history FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own analyses"
    ON analysis_history FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own analyses"
    ON analysis_history FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own analyses"
    ON analysis_history FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Generated images policies (inherit from analysis_history)
CREATE POLICY "Users can view images for their analyses"
    ON generated_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analysis_history
            WHERE analysis_history.id = generated_images.analysis_id
            AND analysis_history.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

CREATE POLICY "Users can insert images for their analyses"
    ON generated_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM analysis_history
            WHERE analysis_history.id = generated_images.analysis_id
            AND analysis_history.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- Improvement suggestions policies (inherit from analysis_history)
CREATE POLICY "Users can view suggestions for their analyses"
    ON improvement_suggestions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM analysis_history
            WHERE analysis_history.id = improvement_suggestions.analysis_id
            AND analysis_history.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

CREATE POLICY "Users can insert suggestions for their analyses"
    ON improvement_suggestions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM analysis_history
            WHERE analysis_history.id = improvement_suggestions.analysis_id
            AND analysis_history.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
        )
    );

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for analysis_history table
CREATE TRIGGER update_analysis_updated_at
    BEFORE UPDATE ON analysis_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. STORAGE BUCKETS (Run this in Supabase Dashboard > Storage)
-- =====================================================

-- NOTE: These need to be created in the Supabase Dashboard or via the Storage API
-- Bucket name: 'analysis-images'
-- Public access: false (users can only access their own images)
-- Allowed MIME types: image/jpeg, image/png
-- Max file size: 10MB

-- Storage policies (apply after creating the bucket):
-- 1. Users can upload images to their own folder:
--    Bucket: analysis-images
--    Policy: INSERT
--    Name: "Users can upload their own images"
--    Target roles: authenticated
--    USING expression: bucket_id = 'analysis-images' AND (storage.foldername(name))[1] = auth.uid()::text

-- 2. Users can view their own images:
--    Bucket: analysis-images
--    Policy: SELECT
--    Name: "Users can view their own images"
--    Target roles: authenticated
--    USING expression: bucket_id = 'analysis-images' AND (storage.foldername(name))[1] = auth.uid()::text

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- After running this schema, you should:
-- 1. Create the 'analysis-images' storage bucket in Supabase Dashboard
-- 2. Set up storage policies for the bucket
-- 3. Update your .env.local with correct Supabase credentials
-- 4. Test the connection from your Next.js app
