-- Create table for CPUs
CREATE TABLE public.cpus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item INTEGER NOT NULL,
  nomenclatura TEXT NOT NULL,
  tombamento TEXT NOT NULL,
  e_estado TEXT NOT NULL,
  marca_modelo TEXT NOT NULL,
  processador TEXT NOT NULL,
  memoria_ram TEXT NOT NULL,
  hd TEXT,
  ssd TEXT,
  sistema_operacional TEXT NOT NULL,
  no_dominio TEXT NOT NULL,
  data_formatacao TEXT,
  responsavel TEXT NOT NULL,
  desfazimento TEXT,
  departamento TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Monitors
CREATE TABLE public.monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item INTEGER NOT NULL,
  tombamento TEXT NOT NULL,
  numero_serie TEXT NOT NULL,
  e_estado TEXT NOT NULL,
  modelo TEXT NOT NULL,
  polegadas TEXT NOT NULL,
  observacao TEXT,
  data_verificacao TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  desfazimento TEXT,
  departamento TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitors ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication yet)
CREATE POLICY "Anyone can view CPUs" 
ON public.cpus 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert CPUs" 
ON public.cpus 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update CPUs" 
ON public.cpus 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete CPUs" 
ON public.cpus 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can view monitors" 
ON public.monitors 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert monitors" 
ON public.monitors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update monitors" 
ON public.monitors 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete monitors" 
ON public.monitors 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cpus_updated_at
  BEFORE UPDATE ON public.cpus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitors_updated_at
  BEFORE UPDATE ON public.monitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();