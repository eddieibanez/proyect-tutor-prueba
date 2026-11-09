-- ====================================================================
-- ESQUEMA SQL ACTUALIZADO PARA CODECRAFT ACADEMY EN SUPABASE
-- Con autenticación por Correo Electrónico, Contraseña y Grado
-- ====================================================================

-- 1. Tabla de Usuarios (Estudiantes y Profesores)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'estudiante', -- 'estudiante' | 'profesor'
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  last_name TEXT,
  grade TEXT, -- '6', '7', '8', '9', '10', '11' (solo estudiantes)
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active DATE DEFAULT CURRENT_DATE
);

-- 2. Tabla de Cursos
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  description TEXT,
  schedule TEXT,
  color TEXT DEFAULT '#00BCD4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Matrículas (Inscripciones de estudiantes a cursos)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 4. Tabla de Progreso Académico por Lenguaje
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  language_id TEXT NOT NULL, -- 'arduino' | 'scratch' | 'python'
  current_level INTEGER DEFAULT 1,
  lessons_completed INTEGER DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  exam_scores JSONB DEFAULT '[]'::jsonb,
  time_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, language_id)
);

-- 5. Tabla de Mensajería Directa Profesor-Estudiante
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  sender TEXT NOT NULL, -- 'teacher' | 'student'
  text TEXT NOT NULL,
  time TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Contenido Personalizado por el Docente (Modo Editor)
CREATE TABLE IF NOT EXISTS public.custom_content (
  lesson_key TEXT PRIMARY KEY, -- 'arduino-1', 'python-3', etc.
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Configuraciones de la Plataforma
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) y políticas públicas para API Anon
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-write for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read-write for courses" ON public.courses;
DROP POLICY IF EXISTS "Allow public read-write for enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Allow public read-write for progress" ON public.progress;
DROP POLICY IF EXISTS "Allow public read-write for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public read-write for custom_content" ON public.custom_content;
DROP POLICY IF EXISTS "Allow public read-write for settings" ON public.settings;

CREATE POLICY "Allow public read-write for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for progress" ON public.progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for custom_content" ON public.custom_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
