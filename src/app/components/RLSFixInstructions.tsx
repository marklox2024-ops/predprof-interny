import React, { useState } from 'react';
import { Shield, Copy, CheckCircle, ExternalLink, User, Key, AlertTriangle } from 'lucide-react';
import { projectId } from '/utils/supabase/info';

const FIX_RLS_SQL = `-- ================================
-- ИСПРАВЛЕНИЕ ОШИБКИ РЕГИСТРАЦИИ
-- ================================
-- Ошибка: "new row violates row-level security policy for table users"
-- Причина: Нет политики INSERT для новых пользователей

-- 1. УДАЛИМ СТАРЫЕ ПОЛИТИКИ (если есть)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- 2. СОЗДАДИМ ПРАВИЛЬНУЮ ПОЛИТИКУ ДЛЯ INSERT
-- Позволяет пользователям создавать свой профиль при регистрации
CREATE POLICY "Users can insert own profile" 
ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. ПРОВЕРИМ ВСЕ ПОЛИТИКИ ДЛЯ USERS
-- SELECT, UPDATE уже должны быть, но на всякий случай пересоздадим

-- Политика для SELECT (чтение всех профилей)
DROP POLICY IF EXISTS "Users can read all profiles" ON users;
CREATE POLICY "Users can read all profiles" 
ON users 
FOR SELECT 
USING (true);

-- Политика для UPDATE (обновление своего профиля)
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" 
ON users 
FOR UPDATE 
USING (auth.uid() = id);

-- 4. ТАКЖЕ НУЖНА ПОЛИТИКА ДЛЯ STATISTICS
-- При регистрации может создаваться запись статистики
DROP POLICY IF EXISTS "Users can insert own statistics" ON statistics;
CREATE POLICY "Users can insert own statistics" 
ON statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. ПРОВЕРКА: Посмотрим все политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'statistics')
ORDER BY tablename, policyname;`;

export function RLSFixInstructions() {
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [adminUserId, setAdminUserId] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        alert('Не удалось скопировать. Пожалуйста, выделите и скопируйте текст вручную.');
      }
      
      document.body.removeChild(textArea);
    }
  };

  const getAdminSQL = () => {
    return `-- Назначение администраторских прав пользователю
UPDATE users 
SET is_admin = true 
WHERE id = '${adminUserId || 'ВСТАВЬТЕ_СЮДА_USER_ID'}';

-- Проверка: посмотреть админа
SELECT id, email, username, is_admin FROM users WHERE is_admin = true;`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Заголовок с анимацией */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-t-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 animate-pulse" />
              <AlertTriangle className="w-8 h-8 absolute -top-2 -right-2 text-yellow-300 animate-bounce" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">🔧 Исправление RLS политики</h1>
              <p className="text-orange-100 mt-2">Критическая ошибка регистрации - требуется настройка Supabase</p>
            </div>
          </div>
          
          {/* Индикатор шагов */}
          <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2">
            {[
              { num: 1, text: 'Создать RLS политику' },
              { num: 2, text: 'Зарегистрироваться' },
              { num: 3, text: 'Получить User ID' },
              { num: 4, text: 'Назначить админа' },
            ].map((step) => (
              <React.Fragment key={step.num}>
                <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-white' : 'text-orange-300'} whitespace-nowrap`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.num ? 'bg-white text-orange-600' : 'bg-orange-400 text-white'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className="font-medium text-sm">{step.text}</span>
                </div>
                {step.num < 4 && <div className="h-0.5 w-8 bg-orange-300 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-b-3xl shadow-2xl p-8">
          
          {/* Шаг 1: Создание RLS политики */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">Что произошло?</h3>
                    <p className="text-red-800 text-sm leading-relaxed">
                      При попытке регистрации возникла ошибка <code className="bg-red-200 px-2 py-1 rounded text-xs">42501</code> - 
                      нарушение Row Level Security (RLS) политики для таблицы <code className="bg-red-200 px-2 py-1 rounded text-xs">users</code>.
                      <br /><br />
                      <strong>Причина:</strong> В базе данных отсутствует политика, разрешающая новым пользователям создавать свои профили.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Шаг 1: Создание RLS политики INSERT
                </h3>
                <p className="text-gray-700 mb-4">
                  Выполните SQL-скрипт в Supabase для создания необходимых RLS политик:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-4">
                  <li className="font-medium">Скопируйте SQL-скрипт ниже (нажмите кнопку)</li>
                  <li className="font-medium">Откройте SQL редактор в Supabase</li>
                  <li className="font-medium">Вставьте скрипт и нажмите <strong>"Run"</strong></li>
                  <li className="font-medium text-green-700">Дождитесь сообщения <code className="bg-green-100 px-2 py-1 rounded text-xs">"Success"</code></li>
                  <li className="font-medium">Проверьте результаты в таблице ниже (должно быть 6 политик)</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-900">
                    <strong>💡 Важно:</strong> После выполнения скрипта вы увидите таблицу с политиками. 
                    Должно быть <strong>6 строк</strong>:
                  </p>
                  <ul className="mt-2 text-xs text-yellow-800 space-y-1 ml-4">
                    <li>• Users can insert own profile (INSERT)</li>
                    <li>• Users can read all profiles (SELECT)</li>
                    <li>• Users can update own profile (UPDATE)</li>
                    <li>• Users can insert own statistics (INSERT)</li>
                    <li>• + 2 политики для statistics (SELECT, UPDATE)</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => copyToClipboard(FIX_RLS_SQL)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        SQL скопирован в буфер обмена!
                      </>
                    ) : (
                      <>
                        <Copy className="w-6 h-6" />
                        Скопировать SQL для RLS политик
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Открыть Supabase SQL Editor
                  </button>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    RLS политики созданы → Перейти к регистрации
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Регистрация */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-600" />
                  Шаг 2: Регистрация первого пользователя
                </h3>
                <p className="text-gray-700 mb-4">
                  Теперь RLS политики созданы, и вы можете зарегистрироваться в приложении:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-4">
                  <li className="font-medium">Обновите страницу (F5 или кнопка ниже)</li>
                  <li className="font-medium">На экране входа нажмите <strong>"Регистрация"</strong></li>
                  <li className="font-medium">Введите email, пароль и имя пользователя</li>
                  <li className="font-medium text-green-700">Регистрация должна пройти <strong>успешно</strong>! ✅</li>
                  <li className="font-medium text-amber-700">Запомните ваш <strong>email</strong> - он понадобится на следующем шаге</li>
                </ol>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-900">
                    <strong>⚠️ Важно:</strong> Убедитесь, что в Supabase отключено подтверждение email:
                  </p>
                  <ul className="mt-2 text-xs text-amber-800 space-y-1 ml-4">
                    <li>• Откройте Authentication → Providers → Email</li>
                    <li>• Найдите "Confirm email" и отключите (toggle OFF)</li>
                    <li>• Нажмите Save</li>
                  </ul>
                  <button
                    onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/auth/providers`, '_blank')}
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Открыть Auth Settings
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    🔄 Обновить страницу для регистрации
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Я зарегистрировался → Получить User ID
                  </button>

                  <button
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    ← Назад к шагу 1
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 3: Получение User ID */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Key className="w-6 h-6 text-purple-600" />
                  Шаг 3: Получение User ID из Supabase
                </h3>
                <p className="text-gray-700 mb-4">
                  Чтобы назначить админские права, нужно узнать ваш User ID:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-4">
                  <li className="font-medium">Откройте таблицу <code className="bg-purple-200 px-2 py-1 rounded text-sm">users</code> в Supabase</li>
                  <li className="font-medium">Найдите строку с вашим email</li>
                  <li className="font-medium">Скопируйте значение из колонки <code className="bg-purple-200 px-2 py-1 rounded text-sm">id</code></li>
                  <li className="font-medium">Вставьте User ID в поле ниже</li>
                </ol>

                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 mb-3">
                    <strong>💡 Как найти User ID:</strong>
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200 font-mono text-xs mb-3">
                    <div className="text-gray-500 mb-1">Table Editor → users → найти свой email</div>
                    <div className="text-blue-700">id: <span className="text-purple-600">abc123-def456-ghi789...</span> ← скопировать это</div>
                  </div>
                  <button
                    onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/editor`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 w-full justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Открыть Table Editor
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Вставьте ваш User ID:
                  </label>
                  <input
                    type="text"
                    value={adminUserId}
                    onChange={(e) => setAdminUserId(e.target.value)}
                    placeholder="abc123-def456-ghi789-..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm"
                  />
                  {adminUserId && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ User ID введен ({adminUserId.length} символов)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setCurrentStep(4)}
                    disabled={!adminUserId || adminUserId.length < 10}
                    className={`px-6 py-4 rounded-xl font-bold shadow-lg transition-all ${
                      adminUserId && adminUserId.length >= 10
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    User ID готов → Назначить администратора
                  </button>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    ← Назад к шагу 2
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 4: Назначение администратора */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-yellow-600" />
                  Шаг 4: Назначение администраторских прав
                </h3>
                <p className="text-gray-700 mb-4">
                  Финальный шаг - назначьте себя администратором, чтобы получить доступ к админ-панели для добавления задач:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-4">
                  <li className="font-medium">Скопируйте SQL-скрипт ниже (ваш User ID уже подставлен)</li>
                  <li className="font-medium">Откройте SQL Editor в Supabase</li>
                  <li className="font-medium">Вставьте скрипт и нажмите <strong>"Run"</strong></li>
                  <li className="font-medium text-green-700">Должно обновиться <strong>1 строка</strong></li>
                  <li className="font-medium">Проверьте результат - должен появиться ваш профиль с is_admin = true</li>
                </ol>

                <div className="bg-white border-2 border-yellow-300 rounded-lg p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-800 whitespace-pre-wrap break-all">{getAdminSQL()}</pre>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => copyToClipboard(getAdminSQL())}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        SQL скопирован!
                      </>
                    ) : (
                      <>
                        <Copy className="w-6 h-6" />
                        Скопировать SQL для назначения админа
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/sql/new`, '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <ExternalLink className="w-6 h-6" />
                    Открыть SQL Editor
                  </button>

                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mt-4">
                    <h4 className="font-bold text-green-900 mb-2">🎉 Настройка завершена!</h4>
                    <p className="text-sm text-green-800 mb-4">
                      После выполнения SQL обновите страницу. Вы получите полный доступ к платформе, включая админ-панель для добавления задач.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all w-full"
                    >
                      ✅ Админ назначен → Обновить и войти
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
                  >
                    ← Назад к шагу 3
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer с подсказкой */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">💡</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Нужна помощь?</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Если возникли трудности, проверьте консоль браузера (F12) на наличие ошибок. 
                Убедитесь, что все SQL скрипты выполнились успешно, и в таблице users есть запись с вашим email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
