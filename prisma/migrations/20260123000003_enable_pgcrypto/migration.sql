-- Enable pgcrypto extension for gen_random_bytes function
-- This is required by uuid_generate_v7() function

-- Note: On Supabase, pgcrypto should already be enabled in extensions schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- Recreate uuid_generate_v7 to use gen_random_bytes from the correct location
-- Supabase has gen_random_bytes in the extensions schema, not pg_catalog
CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Get current timestamp in milliseconds (48 bits)
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  
  -- Build UUIDv7: timestamp (48 bits) + version (4 bits) + random (12 bits) + variant (2 bits) + random (62 bits)
  -- Use extensions.gen_random_bytes for Supabase compatibility
  uuid_bytes = unix_ts_ms || extensions.gen_random_bytes(10);
  
  -- Set version to 7 (0111 in binary) - byte 7, high nibble
  uuid_bytes = set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
  
  -- Set variant to 2 (10xx in binary) - byte 9, high 2 bits
  uuid_bytes = set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
  
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, extensions, pg_catalog;

COMMENT ON FUNCTION public.uuid_generate_v7() IS 'Generates a UUIDv7 (time-ordered UUID) for better index performance than random UUIDv4';
