/*
  # Complete Schema Setup

  1. Types
    - app_role: admin, user
    - check_status: pending, ok, not_found, error
    - media_type: movie, series

  2. Tables
    - profiles: User profiles
    - user_roles: User role assignments
    - media_items: Main media catalog
    - admin_logs: Admin action logs
    - api_cache: API response cache
    - movies, series, seasons, episodes: Legacy tables

  3. Functions
    - handle_new_user: Auto-create profile and assign user role
    - has_role: Check if user has specific role
    - log_admin_action: Log admin actions
    - clean_expired_cache: Clean expired cache entries

  4. Security
    - RLS enabled on all tables
    - Policies for admin access and public read
    - Service role access for edge functions
*/

-- Create enums
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.check_status AS ENUM ('pending', 'ok', 'not_found', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.media_type AS ENUM ('movie', 'series');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create media_items table
CREATE TABLE IF NOT EXISTS public.media_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tmdb_id integer NOT NULL,
    type public.media_type NOT NULL,
    title text NOT NULL,
    poster_url text,
    synopsis text,
    seasons integer DEFAULT 1,
    published boolean DEFAULT false,
    embed_url text,
    last_check_status public.check_status DEFAULT 'pending',
    last_check_message text,
    last_check_date timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(tmdb_id, type)
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action text NOT NULL,
    item_id uuid REFERENCES public.media_items(id) ON DELETE SET NULL,
    status text NOT NULL,
    message text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create api_cache table
CREATE TABLE IF NOT EXISTS public.api_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key text NOT NULL UNIQUE,
    data jsonb NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_item_id uuid,
  p_status text,
  p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (action, item_id, status, message)
  VALUES (p_action, p_item_id, p_status, p_message)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.clean_expired_cache()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.api_cache WHERE expires_at < now();
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_media_items_updated_at ON public.media_items;
CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage media_items" ON public.media_items;
DROP POLICY IF EXISTS "Public can view published media" ON public.media_items;
DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can manage cache" ON public.api_cache;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- CRITICAL: Allow service role (edge functions) to read user_roles
CREATE POLICY "Service role can read user_roles"
  ON public.user_roles FOR SELECT
  TO service_role
  USING (true);

-- Create RLS policies for media_items
CREATE POLICY "Admins can manage media_items"
  ON public.media_items
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view published media"
  ON public.media_items FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Create RLS policies for admin_logs
CREATE POLICY "Admins can view logs"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for api_cache
CREATE POLICY "Admins can manage cache"
  ON public.api_cache
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for new users (auto-assign role)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
