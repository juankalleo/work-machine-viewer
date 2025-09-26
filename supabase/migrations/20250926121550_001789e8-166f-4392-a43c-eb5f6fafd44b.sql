-- Create profiles table for user authentication and roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update CPU policies for admin-only operations
DROP POLICY IF EXISTS "Anyone can delete CPUs" ON public.cpus;
DROP POLICY IF EXISTS "Anyone can insert CPUs" ON public.cpus;

CREATE POLICY "Only admins can delete CPUs" 
ON public.cpus 
FOR DELETE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert CPUs" 
ON public.cpus 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Update Monitor policies for admin-only operations
DROP POLICY IF EXISTS "Anyone can delete monitors" ON public.monitors;
DROP POLICY IF EXISTS "Anyone can insert monitors" ON public.monitors;

CREATE POLICY "Only admins can delete monitors" 
ON public.monitors 
FOR DELETE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert monitors" 
ON public.monitors 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));