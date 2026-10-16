-- Agente Journals schema v1. Execute only in a dedicated private database.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS works (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL,
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 500),
 work_type text NOT NULL CHECK (work_type IN ('scientific_article','book','chapter','novel','essay','research_report')),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','ready','submitted','published')),
 drive_file_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS works_owner_id_idx ON works(owner_id);
CREATE TABLE IF NOT EXISTS work_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 work_id uuid NOT NULL REFERENCES works(id) ON DELETE CASCADE,
 version_number integer NOT NULL CHECK (version_number > 0),
 drive_file_id text NOT NULL,
 notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(work_id,version_number)
);
CREATE TABLE IF NOT EXISTS agent_tasks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 work_id uuid REFERENCES works(id) ON DELETE SET NULL,
 agent_name text NOT NULL,
 instruction text NOT NULL,
 state text NOT NULL DEFAULT 'queued' CHECK (state IN ('queued','running','needs_approval','completed','failed')),
 output_summary text,
 approved_by text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
 id bigserial PRIMARY KEY,
 actor_id text NOT NULL,
 action text NOT NULL,
 resource_id text,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
-- SECURITY: No browser-side direct database access.
-- The API must derive owner_id from verified server-side identity and
-- filter ALL reads/writes by that identity, or implement tested RLS.
-- This migration does NOT itself turn on RLS: never expose this database
-- through an anonymous API or a client-side connection string.
