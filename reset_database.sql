-- ====================================================================
-- SCRIPT DE RESETEO TOTAL: LIMPIAR TODA LA BASE DE DATOS
-- Ejecuta este script en el SQL Editor de Supabase para iniciar desde 0
-- ====================================================================

TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.progress CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.courses CASCADE;
TRUNCATE TABLE public.custom_content CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Si la columna email o password no existen en tu tabla profiles previa, agrégalas con:
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='password') THEN
    ALTER TABLE public.profiles ADD COLUMN password TEXT;
  END IF;
END $$;
