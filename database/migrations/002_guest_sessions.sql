CREATE TABLE IF NOT EXISTS public.guest_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_token_hash TEXT UNIQUE NOT NULL,
    device_fingerprint TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    migrated_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_sessions_hash ON public.guest_sessions(guest_token_hash);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_last_activity ON public.guest_sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_migrated_user ON public.guest_sessions(migrated_to_user_id);
