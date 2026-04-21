-- Supabase SQL Migration: Study Area Finder with Privacy-Safe Location Tracking

-- ============================================================================
-- Table: live_locations
-- Purpose: Store temporary live location data from students
-- Privacy: Records auto-expire after 5 minutes to avoid permanent location history
-- ============================================================================
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy FLOAT DEFAULT NULL, -- GPS accuracy in meters
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  
  -- Optimization indexes
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Indexes for fast queries
CREATE INDEX idx_live_locations_user_id ON live_locations(user_id);
CREATE INDEX idx_live_locations_expires_at ON live_locations(expires_at);
CREATE INDEX idx_live_locations_recorded_at ON live_locations(recorded_at DESC);
-- Spatial index for geographic queries (requires PostGIS)
CREATE INDEX idx_live_locations_geo ON live_locations USING GIST (
  ll_to_earth(latitude, longitude)
);

-- ============================================================================
-- Table: area_occupancy
-- Purpose: Aggregated occupancy data by study area (privacy-safe)
-- Only stores counts, never individual locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS area_occupancy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_area_id UUID NOT NULL UNIQUE REFERENCES public.study_areas(study_area_id) ON DELETE CASCADE,
  current_count INT DEFAULT 0 CHECK (current_count >= 0),
  available_seats INT DEFAULT 0 CHECK (available_seats >= 0),
  occupancy_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (occupancy_percentage >= 0 AND occupancy_percentage <= 100),
  crowd_status VARCHAR(20) DEFAULT 'Unknown' CHECK (crowd_status IN ('Low Crowd', 'Medium Crowd', 'High Crowd', 'Unknown')),
  capacity INT NOT NULL, -- Cached from study_areas for quick access
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_calculation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for occupancy queries
CREATE INDEX idx_area_occupancy_crowd_status ON area_occupancy(crowd_status);
CREATE INDEX idx_area_occupancy_updated_at ON area_occupancy(updated_at DESC);

-- ============================================================================
-- Table: location_permissions (Optional, but recommended for audit)
-- Purpose: Track which users have granted location access
-- ============================================================================
CREATE TABLE IF NOT EXISTS location_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  permission_status VARCHAR(20) NOT NULL CHECK (permission_status IN ('granted', 'denied', 'revoked')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_location_permissions_user_id ON location_permissions(user_id);
CREATE INDEX idx_location_permissions_status ON location_permissions(permission_status);

-- ============================================================================
-- Function: expire_old_locations()
-- Purpose: Clean up expired location records (run via pg_cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION expire_old_locations()
RETURNS void AS $$
BEGIN
  DELETE FROM live_locations
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: calculate_area_occupancy(study_area_id)
-- Purpose: Recalculate occupancy for a specific study area
-- Logic:
--   1. Count users with active location inside the area boundary
--   2. Calculate available seats and occupancy percentage
--   3. Determine crowd status
--   4. Update area_occupancy table
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_area_occupancy(p_study_area_id UUID)
RETURNS TABLE (
  current_count INT,
  available_seats INT,
  occupancy_percentage DECIMAL,
  crowd_status VARCHAR
) AS $$
DECLARE
  v_capacity INT;
  v_count INT;
  v_lat DECIMAL;
  v_lng DECIMAL;
  v_radius_meters INT;
  v_available INT;
  v_percentage DECIMAL;
  v_status VARCHAR;
BEGIN
  -- Get study area details
  SELECT sa.capacity, sa.lat, sa.lng, sa.radius_meters
  INTO v_capacity, v_lat, v_lng, v_radius_meters
  FROM public.study_areas sa
  WHERE sa.study_area_id = p_study_area_id;
  
  IF v_capacity IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0::DECIMAL, 'Unknown'::VARCHAR;
    RETURN;
  END IF;
  
  -- Count active users inside the study area
  -- Using point-in-circle geofence logic
  SELECT COUNT(DISTINCT ll.user_id)
  INTO v_count
  FROM live_locations ll
  WHERE 
    -- User's location is within the circular boundary
    ll.expires_at > NOW() AND -- Location is not expired
    public.earth_distance(
      public.ll_to_earth(ll.latitude, ll.longitude),
      public.ll_to_earth(v_lat, v_lng)
    ) / 1000 <= (v_radius_meters / 1000.0); -- Convert to km and compare
  
  v_count := COALESCE(v_count, 0);
  v_available := v_capacity - v_count;
  v_percentage := CASE 
    WHEN v_capacity > 0 THEN (v_count::DECIMAL / v_capacity) * 100
    ELSE 0
  END;
  
  -- Determine crowd status
  v_status := CASE
    WHEN v_percentage <= 30 THEN 'Low Crowd'
    WHEN v_percentage <= 70 THEN 'Medium Crowd'
    ELSE 'High Crowd'
  END;
  
  -- Update area_occupancy table
  INSERT INTO area_occupancy (study_area_id, current_count, available_seats, occupancy_percentage, crowd_status, capacity, updated_at)
  VALUES (p_study_area_id, v_count, v_available, v_percentage, v_status, v_capacity, NOW())
  ON CONFLICT (study_area_id)
  DO UPDATE SET
    current_count = v_count,
    available_seats = v_available,
    occupancy_percentage = v_percentage,
    crowd_status = v_status,
    updated_at = NOW(),
    last_calculation_at = NOW();
  
  RETURN QUERY SELECT v_count, v_available, v_percentage, v_status;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function: on_location_insert_trigger()
-- Purpose: Recalculate occupancy when a new location is recorded
-- ============================================================================
CREATE OR REPLACE FUNCTION on_location_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_study_area_id UUID;
  v_capacity INT;
  v_lat DECIMAL;
  v_lng DECIMAL;
  v_radius_meters INT;
BEGIN
  -- Find which study areas the location is in and recalculate their occupancy
  FOR v_study_area_id, v_lat, v_lng, v_radius_meters, v_capacity IN
    SELECT sa.study_area_id, sa.lat, sa.lng, sa.radius_meters, sa.capacity
    FROM public.study_areas sa
    WHERE sa.is_active = TRUE
    AND sa.lat IS NOT NULL
    AND sa.lng IS NOT NULL
    AND sa.radius_meters IS NOT NULL
  LOOP
    -- Check if this location is inside the study area
    IF public.earth_distance(
      public.ll_to_earth(NEW.latitude, NEW.longitude),
      public.ll_to_earth(v_lat, v_lng)
    ) / 1000 <= (v_radius_meters / 1000.0) THEN
      -- Recalculate occupancy for this area
      PERFORM calculate_area_occupancy(v_study_area_id);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for location insert
DROP TRIGGER IF EXISTS location_insert_trigger ON live_locations;
CREATE TRIGGER location_insert_trigger
AFTER INSERT ON live_locations
FOR EACH ROW
EXECUTE FUNCTION on_location_insert_trigger();

-- ============================================================================
-- Initialize Bird Nest study area if it doesn't exist
-- ============================================================================
INSERT INTO public.study_areas (
  area_name,
  building,
  capacity,
  wifi,
  charging_ports,
  silent_zone,
  ac,
  cafe,
  is_active,
  area_status,
  lat,
  lng,
  radius_meters,
  created_at
)
VALUES (
  'Bird Nest',
  'Central Tower',
  500,
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  'available',
  40.712776,  -- Example: NYC coordinates
  -74.005974,
  150,  -- 150 meters radius
  NOW()
)
ON CONFLICT (area_name) DO NOTHING;

-- Initialize occupancy record for Bird Nest
INSERT INTO area_occupancy (study_area_id, current_count, available_seats, occupancy_percentage, crowd_status, capacity)
SELECT study_area_id, 0, capacity, 0, 'Low Crowd', capacity
FROM public.study_areas
WHERE area_name = 'Bird Nest'
AND NOT EXISTS (
  SELECT 1 FROM area_occupancy 
  WHERE study_area_id = public.study_areas.study_area_id
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Views for easier querying
-- ============================================================================

-- View: Study areas with current occupancy
CREATE OR REPLACE VIEW study_areas_with_occupancy AS
SELECT 
  sa.study_area_id,
  sa.area_name,
  sa.building,
  sa.capacity,
  sa.wifi,
  sa.charging_ports,
  sa.silent_zone,
  sa.ac,
  sa.cafe,
  sa.lat,
  sa.lng,
  sa.radius_meters,
  ao.current_count,
  ao.available_seats,
  ao.occupancy_percentage,
  ao.crowd_status,
  ao.updated_at as occupancy_updated_at
FROM public.study_areas sa
LEFT JOIN area_occupancy ao ON sa.study_area_id = ao.study_area_id
WHERE sa.is_active = TRUE;

-- View: Crowd summary
CREATE OR REPLACE VIEW crowd_summary AS
SELECT 
  COUNT(*) FILTER (WHERE crowd_status = 'Low Crowd') as low_crowd_areas,
  COUNT(*) FILTER (WHERE crowd_status = 'Medium Crowd') as medium_crowd_areas,
  COUNT(*) FILTER (WHERE crowd_status = 'High Crowd') as high_crowd_areas,
  COUNT(*) FILTER (WHERE crowd_status = 'Unknown') as unknown_status_areas,
  COUNT(*) as total_areas,
  SUM(current_count) as total_students_inside,
  SUM(available_seats) as total_available_seats
FROM area_occupancy;
