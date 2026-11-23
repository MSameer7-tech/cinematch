-- Grant permissions to authenticated, anon, and service_role for all library tables
-- This ensures PostgREST and the frontend can access them correctly

GRANT ALL ON public.watchlists TO anon, authenticated, service_role;
GRANT ALL ON public.favorites TO anon, authenticated, service_role;
GRANT ALL ON public.recently_viewed TO anon, authenticated, service_role;
GRANT ALL ON public.ratings TO anon, authenticated, service_role;
GRANT ALL ON public.user_preferences TO anon, authenticated, service_role;
