import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  checkSupabaseAvailability,
  localLogin,
  localRegister,
  localLogout,
  getCurrentLocalUser,
  getLocalStats,
  type LocalUser,
  type LocalStats,
} from '../utils/localAuth';

interface User {
  id: string;
  email: string;
  username: string;
  rating: number;
  level: number;
}

interface Statistics {
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  total_tasks_solved: number;
  correct_tasks: number;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  stats: Statistics | null;
  isLoading: boolean;
  dbError: boolean;
  rlsError: boolean;
  rlsErrorMessage: string | null;
  isLocalMode: boolean; // Новый флаг режима
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [rlsError, setRlsError] = useState(false);
  const [rlsErrorMessage, setRlsErrorMessage] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Полезная информация для разработчиков
  useEffect(() => {
    console.log('%c🏆 ОлимпИУМ v1.0.0', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
    console.log('%c📚 Образовательная платформа для подготовки к олимпиадам', 'color: #6b7280;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
    
    // Проверяем режим работы
    checkSupabaseAvailability().then(isAvailable => {
      if (isAvailable) {
        console.log('%c✅ Supabase подключен', 'color: #10b981; font-weight: bold;');
      } else {
        console.log('%c⚠️ Локальный режим активирован', 'color: #f59e0b; font-weight: bold;');
        console.log('%c📝 Данные хранятся в localStorage', 'color: #6b7280;');
        console.log('%c🔑 Доступные демо-аккаунты:', 'color: #3b82f6;');
        console.log('%c   demo_student@olimpium.ru / demo123456', 'color: #6b7280;');
        console.log('%c   demo_advanced@olimpium.ru / demo123456', 'color: #6b7280;');
        console.log('%c   demo@demo.com / demo', 'color: #6b7280;');
      }
    });
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #d1d5db;');
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Загружаем профиль пользователя
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        // Проверка на ошибку отсутствия таблицы
        if (userError.code === 'PGRST116' || userError.code === 'PGRST205' || userError.message?.includes('relation "public.users" does not exist') || userError.message?.includes('Could not find the table')) {
          setDbError(true);
          return;
        }
        throw userError;
      }

      setUser(userData);

      // Загружаем статистику
      const { data: statsData, error: statsError } = await supabase
        .from('statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error loading statistics:', statsError);
      } else if (statsData) {
        setStats(statsData);
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      if (error?.message?.includes('relation') || error?.message?.includes('Could not find the table') || error?.code === 'PGRST116' || error?.code === 'PGRST205') {
        setDbError(true);
      }
    }
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadUserProfile(authUser.id);
    }
  };

  useEffect(() => {
    // Проверяем текущую сессию
    const initAuth = async () => {
      try {
        // Сначала проверяем доступность Supabase
        const supabaseAvailable = await checkSupabaseAvailability();
        setIsLocalMode(!supabaseAvailable);
        
        if (!supabaseAvailable) {
          // Локальный режим - проверяем localStorage
          console.log('📦 Инициализация локального режима...');
          const localUser = getCurrentLocalUser();
          if (localUser) {
            setUser(localUser);
            setStats(getLocalStats(localUser.id));
            console.log('✅ Локальный пользователь загружен:', localUser.username);
          }
          setIsLoading(false);
          return;
        }
        
        // Supabase режим
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          // Если нет сессии, все равно проверяем базу данных
          const { error: testError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
          
          if (testError && (testError.code === 'PGRST116' || testError.code === 'PGRST205' || testError.message?.includes('Could not find the table'))) {
            setDbError(true);
          }
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        // При ошибке переключаемся на локальный режим
        setIsLocalMode(true);
        const localUser = getCurrentLocalUser();
        if (localUser) {
          setUser(localUser);
          setStats(getLocalStats(localUser.id));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Подписываемся на изменения аутентификации (только для Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setUser(null);
          setStats(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Проверяем режим работы
      if (isLocalMode) {
        console.log('🔑 Локальный вход:', email);
        const localUser = localLogin(email, password);
        if (localUser) {
          setUser(localUser);
          setStats(getLocalStats(localUser.id));
          console.log('✅ Локальный вход успешен');
        }
        return;
      }
      
      // Supabase режим
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error details:', error);
        
        // Если email не подтвержден, показываем более понятное сообщение
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Email не подтвержден. Пожалуйста, проверьте вашу почту или обратитесь к администратору.');
        }
        
        // Fallback на локальный режим при ошибке
        console.warn('⚠️ Ошибка Supabase, попытка локального входа...');
        try {
          const localUser = localLogin(email, password);
          if (localUser) {
            setIsLocalMode(true);
            setUser(localUser);
            setStats(getLocalStats(localUser.id));
            console.log('✅ Переключено на локальный режим');
            return;
          }
        } catch (localError) {
          // Если и локальный вход не удался, бросаем оригинальную ошибку
          throw error;
        }
        
        throw error;
      }
      
      if (data.user) {
        setSupabaseUser(data.user);
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      console.log('Registration - Starting registration for:', email);
      
      // Проверяем режим работы
      if (isLocalMode) {
        console.log('📝 Локальная регистрация:', email);
        const newUser = localRegister(email, password, username);
        setUser(newUser);
        setStats(getLocalStats(newUser.id));
        console.log('✅ Локальная регистрация успешна');
        return;
      }
      
      // Supabase режим
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (signUpError) {
        console.error('Registration - SignUp error:', signUpError);
        
        // Проверка на ошибки базы данных (таблица users не создана)
        if (signUpError.message.includes('Database error saving new user') || 
            signUpError.message.includes('relation "public.users" does not exist')) {
          console.error('❌ DATABASE TABLE ERROR DETECTED!');
          setRlsError(true);
          setRlsErrorMessage('Таблица users не создана. Необходимо выполнить SQL скрипт настройки.');
          throw new Error('DATABASE_TABLE_ERROR: ' + signUpError.message);
        }
        
        // Rate limit - переключаемся на локальный режим
        if (signUpError.message.includes('rate limit') || signUpError.message.includes('too many')) {
          console.warn('⚠️ Rate limit обнаружен, переключение на локальный режим...');
          setIsLocalMode(true);
          const newUser = localRegister(email, password, username);
          setUser(newUser);
          setStats(getLocalStats(newUser.id));
          console.log('✅ Регистрация в локальном режиме успешна');
          return;
        }
        
        // Если пользователь уже существует, предлагаем войти
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('already been registered') ||
            signUpError.message.includes('User already registered')) {
          throw new Error('Пользователь с таким email уже зарегистрирован. Попробуйте войти.');
        }
        
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('Registration failed: No user data returned');
      }

      console.log('Registration - User created in Auth:', data.user.id);

      // Создаём профиль пользователя в таблице users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          username: username,
          rating: 1200,
          level: 1,
          is_admin: false,
        });

      if (profileError) {
        console.error('Registration - Profile creation error:', profileError);
        
        // Проверяем на ошибку RLS (код 42501)
        if (profileError.code === '42501') {
          console.error('❌ RLS POLICY ERROR DETECTED!');
          setRlsError(true);
          setRlsErrorMessage(profileError.message);
          throw new Error('RLS_POLICY_ERROR: ' + profileError.message);
        }
        
        // Если профиль уже существует, это нормально (пользователь уже регистрировался)
        if (profileError.code === '23505') {
          console.log('Registration - Profile already exists, logging in...');
          await login(email, password);
          return;
        }
        
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      console.log('Registration - Profile created successfully');

      // Создаём запись статистики
      const { error: statsError } = await supabase
        .from('statistics')
        .insert({
          user_id: data.user.id,
          total_matches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          total_tasks_solved: 0,
          correct_tasks: 0,
        });

      if (statsError) {
        console.error('Registration - Statistics creation error:', statsError);
        // Не падаем, если статистика не создалась
      } else {
        console.log('Registration - Statistics created successfully');
      }

      // После успешной регистрации логиним пользователя
      console.log('Registration - Logging in user...');
      await login(email, password);
      
      console.log('Registration - Complete!');
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (isLocalMode) {
      localLogout();
      setUser(null);
      setStats(null);
      return;
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setStats(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        stats,
        isLoading,
        dbError,
        rlsError,
        rlsErrorMessage,
        isLocalMode,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}