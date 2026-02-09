import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Trophy, Sparkles, Zap, Award, Target, AlertTriangle, Rocket, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { SetupInstructions } from '../components/SetupInstructions';

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [showRateLimitHelp, setShowRateLimitHelp] = useState(false);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const { login, register, user, rlsError, rlsErrorMessage, isLocalMode } = useAuth();
  const navigate = useNavigate();

  // Демо-аккаунты для быстрого входа
  const DEMO_ACCOUNTS = {
    student: {
      email: 'demo_student@olimpium.ru',
      password: 'demo123456',
      username: 'Демо Ученик',
      description: '🎓 Обычный ученик'
    },
    advanced: {
      email: 'demo_advanced@olimpium.ru',
      password: 'demo123456',
      username: 'Продвинутый Олимпиец',
      description: '⭐ Продвинутый уровень'
    }
  };

  useEffect(() => {
    // Если пользователь уже авторизован, перенаправляем на дашборд
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Показываем инструкции по настройке при RLS ошибке
  // ОТКЛЮЧЕНО: убрали автоматический показ модального окна
  // useEffect(() => {
  //   if (rlsError) {
  //     setShowSetupInstructions(true);
  //   }
  // }, [rlsError]);

  // Таймер обратного отсчета для rate limit
  useEffect(() => {
    if (!rateLimitUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((rateLimitUntil - now) / 1000));
      setRemainingTime(remaining);

      if (remaining === 0) {
        setRateLimitUntil(null);
        setShowRateLimitHelp(false);
        setError('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!email || !password) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (mode === 'register') {
      if (!username) {
        setError('Укажите никнейм');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Пароли не совпадают');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(email, password, username);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Проверяем на ошибки базы данных
      if (err.message?.includes('DATABASE_TABLE_ERROR') || 
          err.message?.includes('Database error saving new user') ||
          err.message?.includes('RLS_POLICY_ERROR')) {
        // Ошибка уже обрабатывается через rlsError в useEffect
        return;
      }
      
      // Переводим ошибки на русский
      if (err.message?.includes('Invalid login credentials')) {
        setError('Неверный email или пароль');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email подтверждается автоматически. Пожалуйста, подождите несколько секунд и попробуйте снова.');
      } else if (err.message?.includes('User already registered') || err.message?.includes('already been registered')) {
        setError('Пользователь с таким email уже зарегистрирован. Попробуйте войти.');
      } else if (err.message?.includes('email rate limit exceeded') || err.message?.includes('rate limit')) {
        setError('Слишком много попыток. Попробуйте позже или используйте другой email.');
        setShowRateLimitHelp(true);
        const now = Date.now();
        const rateLimitDuration = 60 * 1000; // 1 минута
        setRateLimitUntil(now + rateLimitDuration);
      } else if (err.message?.includes('row-level security') || err.message?.includes('violates row-level security policy')) {
        setError('❌ ОШИБКА: Row Level Security не настроен в Supabase. Выполните SQL из документации.');
      } else {
        setError(err.message || 'Произошла ошибка. Попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    setShowRateLimitHelp(false);
    
    // АВТОМАТИЧЕСКИ генерируем тестовые данные при переключении на регистрацию
    if (newMode === 'register') {
      const randomId = Math.random().toString(36).substring(2, 10);
      const testEmail = `test_${randomId}@olimpium.ru`;
      const testUsername = `Олимпиец_${randomId.substring(0, 5)}`;
      const testPassword = 'test123456';
      
      setEmail(testEmail);
      setUsername(testUsername);
      setPassword(testPassword);
      setPasswordConfirm(testPassword);
    } else {
      // Очищаем поля при переключении на вход
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      setUsername('');
    }
  };

  const handleDemoLogin = async (accountType: 'student' | 'advanced') => {
    const account = DEMO_ACCOUNTS[accountType];
    setIsLoading(true);
    setError('');
    
    try {
      await login(account.email, account.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Demo login error:', err);
      
      // Если демо-аккаунт не существует - показываем инструкцию
      if (err.message?.includes('Invalid login credentials')) {
        setError(`❌ Демо-аккаунт "${account.username}" не создан в Supabase.`);
        setShowRateLimitHelp(false);
        // Показываем модальное окно с инструкциями
        setTimeout(() => {
          alert(
            `📋 КАК СОЗДАТЬ ДЕМО-АККАУНТ:\n\n` +
            `1. Откройте Supabase Dashboard:\n` +
            `   Authentication → Users → Add User\n\n` +
            `2. Создайте пользователя:\n` +
            `   Email: ${account.email}\n` +
            `   Password: ${account.password}\n` +
            `   ✅ Auto Confirm User: ON (ВАЖНО!)\n\n` +
            `3. Выполните SQL скрипт повторно:\n` +
            `   (он создаст профиль автоматически)\n\n` +
            `4. Нажмите демо-вход снова\n\n` +
            `📄 Подробнее: /СОЗДАНИЕ_ДЕМО_АККАУНТОВ.md`
          );
        }, 500);
      } else if (err.message?.includes('Email not confirmed')) {
        setError(`⚠️ Демо-аккаунт не подтвержден. При создании включите "Auto Confirm User"!`);
      } else {
        setError(err.message || 'Ошибка входа в демо-аккаунт');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 relative z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-sky-400 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5" />
          
          {/* Local Mode Indicator */}
          {isLocalMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <WifiOff className="w-4 h-4" />
              Локальный режим
            </motion.div>
          )}
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-4 mb-2 relative z-10"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <Trophy className="w-12 h-12 text-white drop-shadow-lg" />
              <Sparkles className="w-5 h-5 text-white/80 absolute -top-1 -right-1" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">ОлимпИУМ</h1>
          </motion.div>
          <p className="text-white/90 relative z-10">Платформа подготовки к олимпиадам</p>
          
          {/* Local Mode Info */}
          {isLocalMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg p-3 relative z-10"
            >
              <p className="text-white/90 text-sm">
                📦 Данные хранятся локально. Регистрация не требует Supabase.
              </p>
            </motion.div>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="p-4 bg-gray-50/50">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Вход
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Регистрация
            </motion.button>
          </div>

          {/* Rate Limit Warning */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    ⚠️ Проблемы с регистрацией?
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Если видите "rate limit exceeded" - переключитесь на <strong>Вход</strong> и используйте демо-аккаунт
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Demo Account Info */}
          {mode === 'login' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3"
            >
              <div className="flex items-start gap-2">
                <Rocket className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    🚀 Демо-аккаунты доступны!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Войдите одной кнопкой - никакой регистрации не требуется
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Никнейм
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all bg-white"
                placeholder="Ваш никнейм"
                disabled={isLoading}
              />
            </motion.div>
          )}

          {mode === 'register' && email && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3"
            >
              <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  ✨ Тестовые данные сгенерированы автоматически!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Можете изменить или сразу нажать "Зарегистрироваться"
                </p>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all bg-white"
              placeholder="example@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all bg-white"
              placeholder="Минимум 6 символов"
              disabled={isLoading}
            />
          </div>

          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Повторите пароль
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all bg-white"
                placeholder="Повторите пароль"
                disabled={isLoading}
              />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white font-medium py-3 px-6 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Загрузка...
              </div>
            ) : (
              mode === 'login' ? 'Войти' : 'Зарегистрироваться'
            )}
          </motion.button>

          {/* Demo Login Buttons */}
          {mode === 'login' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">или попробуйте демо-аккаунт</span>
                </div>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-medium py-3 px-6 rounded-xl shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  🎓 Демо: Обычный ученик
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleDemoLogin('advanced')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-6 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  ⭐ Демо: Продвинутый олимпиец
                </motion.button>
              </div>
            </>
          )}
        </form>

        {/* Setup Instructions */}
        {showSetupInstructions && (
          <SetupInstructions
            errorMessage={rlsErrorMessage}
            onClose={() => setShowSetupInstructions(false)}
          />
        )}

        {/* RLS Error Alert - КРИТИЧЕСКАЯ ОШИБКА БД */}
        {rlsError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={(e) => {
              // Закрыть при клике на backdrop
              if (e.target === e.currentTarget) {
                // Не закрываем - это критическая ошибка!
              }
            }}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-12 h-12 flex-shrink-0 animate-pulse" />
                  <div>
                    <h2 className="text-3xl font-bold mb-2">🚨 КРИТИЧЕСКАЯ ОШИБКА БД</h2>
                    <p className="text-red-100 text-lg">
                      База данных Supabase не настроена. Приложение не может работать без настройки БД.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Error Details */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-900 mb-2">Ошибка:</h3>
                  <code className="text-sm text-red-800 font-mono block bg-red-100 p-3 rounded-lg">
                    {rlsErrorMessage}
                  </code>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">⚡ ЧТО НУЖНО СДЕЛАТЬ (60 секунд)</h3>
                  
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Откройте Supabase SQL Editor</p>
                        <button
                          onClick={() => window.open('https://supabase.com/dashboard/project/YHbTYWT7kLb4Zw1RXUphjX/editor/sql', '_blank')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          → Открыть SQL Editor (новая вкадка)
                        </button>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Скопируйте SQL скрипт</p>
                        <p className="text-sm text-gray-600">Нажмите кнопку "Показать SQL" ниже</p>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Вставьте в SQL Editor и нажмите RUN</p>
                        <p className="text-sm text-gray-600">Дождитесь "Success. No rows returned"</p>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Обновите эту страницу</p>
                        <p className="text-sm text-gray-600">Нажмите F5 или Ctrl+R</p>
                      </div>
                    </li>

                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">5</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Зарегистрируйтесь снова</p>
                        <p className="text-sm text-gray-600 bg-yellow-100 border border-yellow-300 p-2 rounded mt-1">
                          ⚠️ Используйте ДРУГОЙ email (не тот что вводили раньше)
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-yellow-900 font-semibold">
                    🚨 <strong>ВАЖНО:</strong> Без выполнения SQL скрипта приложение НЕ БУДЕТ РАБОТАТЬ!
                  </p>
                  <p className="text-yellow-800 text-sm mt-2">
                    Ошибка находится в базе данных Supabase, а не в коде. Изменения в коде не помогут.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open('https://supabase.com/dashboard/project/YHbTYWT7kLb4Zw1RXUphjX/editor/sql', '_blank')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    🚀 Открыть SQL Editor
                  </button>
                  <button
                    onClick={() => setShowSetupInstructions(true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    📋 Показать SQL
                  </button>
                </div>

                {/* Documentation Links */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">📚 Дополнительная документация:</p>
                  <div className="flex flex-wrap gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">/СРОЧНО_ВЫПОЛНИТЕ_SQL.md</code>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">/РЕШЕНИЕ_СЕЙЧАС.md</code>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">/SUPABASE_SETUP_SAFE.sql</code>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Rate Limit Help */}
        {showRateLimitHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRateLimitHelp(false);
              }
            }}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-12 h-12 flex-shrink-0 animate-pulse" />
                  <div>
                    <h2 className="text-3xl font-bold mb-2">⏰ ВАШ IP ЗАБЛОКИРОВАН</h2>
                    <p className="text-orange-100 text-lg">
                      Слишком много попыток регистрации. Ваш IP-адрес временно заблокирован Supabase.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* НОВОЕ: Демо-аккаунт решение */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Rocket className="w-10 h-10 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-900 mb-2">🚀 МГНОВЕННОЕ РЕШЕНИЕ</h3>
                      <p className="text-green-800">
                        Используйте демо-аккаунт - вход без регистрации!
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowRateLimitHelp(false);
                        setTimeout(() => switchMode('login'), 300);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                      <Rocket className="w-6 h-6" />
                      ПОПРОБОВАТЬ ДЕМО-ВХОД СЕЙЧАС
                    </button>
                    
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <p className="text-sm text-green-900 font-medium mb-2">Что делать:</p>
                      <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
                        <li>Нажмите кнопку выше</li>
                        <li>Вы попадете на вкладку "Вход"</li>
                        <li>Прокрутите вниз и нажмите "🎓 Демо: Обычный ученик"</li>
                        <li>Готово - вы в системе без регистрации!</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Timer */}
                {remainingTime > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 text-center">
                    <div className="text-6xl font-bold text-orange-600 mb-2">
                      {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-orange-800 font-medium">
                      Минимальное время ожидания
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Реальная блокировка может длиться до 10-15 минут
                    </p>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <h3 className="font-bold text-yellow-900 mb-2">🔍 Что произошло?</h3>
                  <p className="text-yellow-800 text-sm">
                    Supabase Auth обнаружил множественные попытки регистрации с вашего IP-адреса и временно заблокировал доступ. 
                    Это стандартная защита от спама и атак.
                  </p>
                </div>

                {/* Solutions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">✅ 3 СПОСОБА РЕШЕНИЯ</h3>
                  
                  <div className="space-y-6">
                    {/* Solution 1 */}
                    <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                        <div className="flex-1">
                          <p className="font-bold text-green-900 text-lg">ПОДОЖДИТЕ 10-15 МИНУТ ⏰</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Самый надежный способ.</strong> Закройте браузер, выпейте чай, вернитесь через 15 минут.
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-800">
                          ✅ Гарантировано работает<br/>
                          ✅ Не требует дополнительных действий<br/>
                          ✅ Блокировка полностью снимется
                        </p>
                      </div>
                    </div>

                    {/* Solution 2 */}
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                        <div className="flex-1">
                          <p className="font-bold text-blue-900 text-lg">РЕЖИМ ИНКОГНИТО 🕵️</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Быстрое решение.</strong> Откройте приложение в режиме инкогнито (Ctrl+Shift+N).
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-800">
                          ✅ Работает сразу<br/>
                          ⚠️ Может не сработать если IP-адрес заблокирован<br/>
                          💡 Попробуйте первым делом
                        </p>
                      </div>
                    </div>

                    {/* Solution 3 */}
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                        <div className="flex-1">
                          <p className="font-bold text-purple-900 text-lg">ДРУГАЯ СЕТЬ 📱</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Альтернативный способ.</strong> Используйте мобильный интернет или другой Wi-Fi.
                          </p>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-800">
                          ✅ 100% работает (другой IP)<br/>
                          💡 Включите точку доступа на телефоне<br/>
                          💡 Или переключитесь на мобильный интернет
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <h3 className="font-bold text-red-900 mb-2">🚨 ВАЖНО ПОНИМАТЬ</h3>
                  <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                    <li>Блокировка на уровне <strong>IP-адреса</strong>, а не email</li>
                    <li>Автоматическая генерация email <strong>не поможет</strong></li>
                    <li>Нужно либо <strong>подождать</strong>, либо <strong>сменить IP</strong></li>
                    <li>Это защита Supabase, мы не можем её отключить</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowRateLimitHelp(false);
                      setTimeout(() => {
                        alert('💡 Совет:\n\n1. Закройте это приложение\n2. Подождите 10-15 минут\n3. Вернитесь и нажмите "Регистрация"\n4. Сразу нажмите "Зарегистрироваться"\n\nБлокировка снимется автоматически!');
                      }, 300);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    ⏰ Понятно, подожду 10-15 минут
                  </button>
                  
                  <button
                    onClick={() => {
                      window.open('about:blank', '_blank');
                      setTimeout(() => {
                        alert('💡 Режим инкогнито:\n\n1. Нажмите Ctrl+Shift+N (Chrome)\n2. Или Ctrl+Shift+P (Firefox)\n3. Откройте приложение в новом окне\n4. Попробуйте зарегистрироваться');
                      }, 300);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    🕵️ Открыть в режиме инкогнито
                  </button>

                  <button
                    onClick={() => setShowRateLimitHelp(false)}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}