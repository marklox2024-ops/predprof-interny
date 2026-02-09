import { useState } from 'react';
import { AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface SetupInstructionsProps {
  errorMessage?: string | null;
  onClose?: () => void;
}

export function SetupInstructions({ errorMessage, onClose }: SetupInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- БЕЗОПАСНАЯ НАСТРОЙКА БД "ОлимпИУМ" (БЕЗ УДАЛЕНИЯ ДАННЫХ)
-- Выполните этот SQL в Supabase Dashboard → SQL Editor
-- Этот скрипт НЕ удаляет существующие данные!
-- Использует ALTER TABLE для добавления недостающих колонок

-- ============================================
-- 1. СОЗДАНИЕ ТАБЛИЦ (если не существуют)
-- ============================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  rating INTEGER DEFAULT 1200,
  level INTEGER DEFAULT 1,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица статистики
CREATE TABLE IF NOT EXISTS public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_tasks_solved INTEGER DEFAULT 0,
  correct_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Таблица предметов (БЕЗ description и icon - добавим позже)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ДОБАВЛЕНИЕ НЕДОСТАЮЩИХ КОЛОНОК (БЕЗОПАСНО)
-- ============================================

-- Добавляем description и icon в subjects (если их нет)
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- ВАЖНО: Добавляем UNIQUE constraint если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subjects_name_key' 
    AND conrelid = 'public.subjects'::regclass
  ) THEN
    ALTER TABLE public.subjects ADD CONSTRAINT subjects_name_key UNIQUE (name);
  END IF;
END $$;

-- ВАЖНО: Устанавливаем DEFAULT для id если его нет
ALTER TABLE public.subjects 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Таблица задач
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 10,
  correct_answer TEXT NOT NULL,
  options JSONB,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица матчей
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')) DEFAULT 'waiting',
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  current_problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
  player1_ready BOOLEAN DEFAULT false,
  player2_ready BOOLEAN DEFAULT false,
  problems_used JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- 3. ВКЛЮЧЕНИЕ RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
CREATE POLICY "Users can read all profiles" 
ON public.users 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- ============================================
-- 5. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ STATISTICS
-- ============================================

DROP POLICY IF EXISTS "Users can insert own statistics" ON public.statistics;
CREATE POLICY "Users can insert own statistics" 
ON public.statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read all statistics" ON public.statistics;
CREATE POLICY "Users can read all statistics" 
ON public.statistics 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own statistics" ON public.statistics;
CREATE POLICY "Users can update own statistics" 
ON public.statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================================
-- 6. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ SUBJECTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can read subjects" ON public.subjects;
CREATE POLICY "Anyone can read subjects" 
ON public.subjects 
FOR SELECT 
USING (true);

-- ============================================
-- 7. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ PROBLEMS
-- ============================================

DROP POLICY IF EXISTS "Anyone can read problems" ON public.problems;
CREATE POLICY "Anyone can read problems" 
ON public.problems 
FOR SELECT 
USING (true);

-- ============================================
-- 8. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MATCHES
-- ============================================

DROP POLICY IF EXISTS "Users can read own matches" ON public.matches;
CREATE POLICY "Users can read own matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

DROP POLICY IF EXISTS "Users can insert matches" ON public.matches;
CREATE POLICY "Users can insert matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() = player1_id);

DROP POLICY IF EXISTS "Users can update own matches" ON public.matches;
CREATE POLICY "Users can update own matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- ============================================
-- 9. ЗАПОЛНЕНИЕ ПРЕДМЕТОВ
-- ============================================

-- Используем ON CONFLICT для безопасного добавления
INSERT INTO public.subjects (name, description, icon) VALUES
  ('Математика', 'Алгебра, геометрия, теория чисел', '🔢'),
  ('Физика', 'Механика, электричество, оптика', '⚛️'),
  ('Химия', 'Органическая и неорганическая химия', '🧪'),
  ('Биология', 'Ботаника, зоология, генетика', '🧬'),
  ('История', 'Всемирная и российская история', '📜'),
  ('Литература', 'Русская и зарубежная литература', '📚'),
  ('География', 'Физическая и экономическая география', '🌍'),
  ('Обществознание', 'Право, экономика, социология', '⚖️'),
  ('Информатика', 'Алгоритмы, программирование', '💻')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- ============================================
-- 10. СОЗДАНИЕ ТРИГГЕРА ДЛЯ UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_statistics_updated_at ON public.statistics;
CREATE TRIGGER update_statistics_updated_at 
BEFORE UPDATE ON public.statistics 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- База данных "ОлимпИУМ" настроена безопасно.
-- Все существующие данные сохранены!
-- Теперь обновите страницу и попробуйте зарегистрироваться.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const supabaseUrl = 'https://supabase.com/dashboard/project/YHbTYWT7kLb4Zw1RXUphjX/editor/sql';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                Требуется настройка базы данных ОлимпИУМ
              </h2>
              <p className="text-red-700">
                База данных не настроена. Выполните SQL команды ниже для создания всех таблиц и политик безопасности.
              </p>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-600 font-mono bg-red-100 p-2 rounded">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                1
              </div>
              <h3 className="font-semibold text-gray-900">
                Откройте Supabase SQL Editor
              </h3>
            </div>
            <a
              href={supabaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть SQL Editor
            </a>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                2
              </div>
              <h3 className="font-semibold text-gray-900">
                Скопируйте и выполните SQL
              </h3>
            </div>
            
            {/* Safe script notice */}
            <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ <strong>Безопасно:</strong> Этот скрипт НЕ удаляет существующие данные! 
                Он использует ALTER TABLE для добавления недостающих колонок.
              </p>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sqlScript}</code>
              </pre>
              
              <button
                onClick={handleCopy}
                className="absolute top-4 right-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Копировать SQL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                3
              </div>
              <h3 className="font-semibold text-gray-900">
                Обновите страницу и попробуйте снова
              </h3>
            </div>
            <p className="text-gray-600">
              После выполнения SQL команд обновите эту страницу и попробуйте зарегистрироваться снова.
            </p>
          </div>

          {/* Why this happens */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Почему это происходит?
            </h4>
            <p className="text-blue-800 text-sm">
              При первом использовании приложения необходимо создать RLS (Row Level Security) 
              политики в базе данных. Это гарантирует безопасность данных пользователей. 
              Это нужно сделать только один раз.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Обновить страницу
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}