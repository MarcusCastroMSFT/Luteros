-- UUIDv7 Generator Function for PostgreSQL
-- UUIDv7 is time-ordered, making it much better for B-tree index performance
-- compared to random UUIDv4 (gen_random_uuid())
--
-- Benefits:
-- 1. Sequential/time-ordered: Better B-tree index fill factor, less page splits
-- 2. Sortable: Natural chronological ordering
-- 3. Globally unique: Safe for distributed systems
-- 4. Timestamp extractable: Can derive creation time from ID

CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Get current timestamp in milliseconds (48 bits)
  unix_ts_ms = pg_catalog.substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint), 3);
  
  -- Build UUIDv7: timestamp (48 bits) + version (4 bits) + random (12 bits) + variant (2 bits) + random (62 bits)
  uuid_bytes = unix_ts_ms || pg_catalog.gen_random_bytes(10);
  
  -- Set version to 7 (0111 in binary) - byte 7, high nibble
  uuid_bytes = pg_catalog.set_byte(uuid_bytes, 6, (pg_catalog.get_byte(uuid_bytes, 6) & 15) | 112);
  
  -- Set variant to 2 (10xx in binary) - byte 9, high 2 bits
  uuid_bytes = pg_catalog.set_byte(uuid_bytes, 8, (pg_catalog.get_byte(uuid_bytes, 8) & 63) | 128);
  
  RETURN pg_catalog.encode(uuid_bytes, 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE
SET search_path = public, pg_catalog;

-- Optional: Function to extract timestamp from UUIDv7
CREATE OR REPLACE FUNCTION public.uuid_v7_to_timestamptz(uuid_v7 uuid)
RETURNS timestamptz
AS $$
DECLARE
  uuid_hex text;
  unix_ts_ms bigint;
BEGIN
  uuid_hex = pg_catalog.replace(uuid_v7::text, '-', '');
  -- Extract first 48 bits (12 hex chars) which contain the timestamp
  unix_ts_ms = ('x' || pg_catalog.substr(uuid_hex, 1, 12))::bit(48)::bigint;
  RETURN pg_catalog.to_timestamp(unix_ts_ms / 1000.0);
END
$$
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_catalog;

COMMENT ON FUNCTION public.uuid_generate_v7() IS 'Generates a UUIDv7 (time-ordered UUID) for better index performance than random UUIDv4';
COMMENT ON FUNCTION public.uuid_v7_to_timestamptz(uuid) IS 'Extracts the timestamp from a UUIDv7';
