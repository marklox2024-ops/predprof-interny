import React, { useState } from 'react';
import { Database, Copy, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { projectId } from '/utils/supabase/info';

// SQL-схема для создания всех таблиц
const SCHEMA_SQL = `-- ПОЛНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ "ОлимпИУМ"
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

-- ============================================
-- 1. СОЗДАНИЕ ТАБЛИЦ
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

-- Таблица предметов
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- 2. ВКЛЮЧЕНИЕ RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

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
-- 4. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ STATISTICS
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
-- 5. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ SUBJECTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can read subjects" ON public.subjects;
CREATE POLICY "Anyone can read subjects" 
ON public.subjects 
FOR SELECT 
USING (true);

-- ============================================
-- 6. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ PROBLEMS
-- ============================================

DROP POLICY IF EXISTS "Anyone can read problems" ON public.problems;
CREATE POLICY "Anyone can read problems" 
ON public.problems 
FOR SELECT 
USING (true);

-- ============================================
-- 7. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MATCHES
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
-- 8. СОЗДАНИЕ ТРИГГЕРА ДЛЯ UPDATED_AT
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

-- ГОТОВО! Переходите к шагу 2 для загрузки предметов.`;

const DATA_SQL = `-- ============================================
-- ЗАПОЛНЕНИЕ ПРЕДМЕТОВ
-- ============================================

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
ON CONFLICT (name) DO NOTHING;

-- ГОТОВО! ✅ Теперь обновите страницу.`;

export function DatabaseSetup() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      // Пытаемся использовать Clipboard API
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback для случаев, когда Clipboard API недоступен
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('Failed to copy using fallback method');
          alert('Н удалось скопировать. Пожалуйста, выделите и скопируйте текст вручную.');
        }
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
        alert('Не удалось скопировать. Пожалуйста, выделите и скопируйте текст вручную.');
      }
    }
  };

  const openSQLEditor = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Database className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-bold">Настройка базы данных</h1>
              <p className="text-blue-100 mt-2">ОлимпИУМ требует настройки Supabase</p>
            </div>
          </div>
          
          {/* Прогресс */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400'}`}>
                1
              </div>
              <span className="font-medium">Создать таблицы</span>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-200" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-blue-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-400'}`}>
                2
              </div>
              <span className="font-medium">Загрузить данные</span>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Шаг 1: Создание таблиц</h3>
                <p className="text-gray-700 mb-4">
                  Скопируйте SQL-скрипт ниже и выполните его в редакторе SQL Supabase для создания всех необходимых таблиц, политик RLS и триггеров.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Скопируйте SQL-скрипт, нажав кнопку ниже</li>
                  <li>Откройте SQL редактор в Supabase</li>
                  <li>Вставьте скопированный скрипт</li>
                  <li>Нажмите "Run" для выполнения</li>
                  <li><strong>Дождитесь сообщения "Success. No rows returned"</strong> - это означает успешное выполнение ✅</li>
                  <li>После этого нажмите "Таблицы созданы"</li>
                </ol>
                
                <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>ℹ️ Важно:</strong> Сообщение <code className="bg-green-200 px-2 py-1 rounded">"Success. No rows returned"</code> - это <strong>успех</strong>, а не ошибка! DDL-запросы (создание таблиц) не возвращают данные.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => copyToClipboard(SCHEMA_SQL)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      SQL скопирован!
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" />
                      Скопировать SQL для создания таблиц
                    </>
                  )}
                </button>

                <button
                  onClick={openSQLEditor}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-6 h-6" />
                  Открыть Supabase SQL Editor
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Таблицы созданы → Перейти к шагу 2
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Шаг 2: Загрузка начальных данных</h3>
                <p className="text-gray-700 mb-4">
                  Теперь загрузите предметы в базу данных. Задачи будут автоматически добавлены при первом запуске приложения.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Скопируйте SQL-скрипт данных</li>
                  <li>Откройте SQL редактор в Supabase</li>
                  <li>Вставьте и выполните скрипт</li>
                  <li><strong>Дождитесь сообщения "Success. No rows returned"</strong> ✅</li>
                  <li>Нажмите "Обновить страницу"</li>
                </ol>
                
                <div className="mt-4 bg-amber-100 border border-amber-300 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>💡 Подсказка:</strong> После обновления страницы вы увидите экран входа. Зарегистрируйтесь, и 135 задач по 9 предметам будут автоматически загружены!
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ ВАЖНО: Отключите подтверждение email</h3>
                <p className="text-sm text-red-800 mb-3">
                  Для работы регистрации необходимо отключить подтверждение email в настройках Supabase, иначе будет ошибка "email rate limit exceeded".
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
                  <li>Откройте <strong>Authentication → Providers</strong> в Supabase Dashboard</li>
                  <li>Нажмите на <strong>Email</strong></li>
                  <li>Найдите <strong>"Confirm email"</strong></li>
                  <li>Отключите эту опцию (toggle OFF)</li>
                  <li>Нажмите <strong>Save</strong></li>
                </ol>
                <button
                  onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/auth/providers`, '_blank')}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Открыть Authentication Settings
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => copyToClipboard(DATA_SQL)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      SQL скопирован!
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" />
                      Скопировать SQL данных
                    </>
                  )}
                </button>

                <button
                  onClick={openSQLEditor}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <ExternalLink className="w-6 h-6" />
                  Открыть Supabase SQL Editor
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Данные загружены → Обновить страницу
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold transition-all"
                >
                  ← Вернуться к шагу 1
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}