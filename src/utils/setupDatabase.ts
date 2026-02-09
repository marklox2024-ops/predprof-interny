/**
 * Утилита для автоматической настройки базы данных
 * Выполняет необходимые SQL команды для создания RLS политик
 */

import { supabase } from '@/lib/supabase';

export async function setupDatabasePolicies(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔧 Setting up database policies...');

    // SQL для создания всех необходимых RLS политик
    const setupSQL = `
      -- ===================================
      -- АВТОМАТИЧЕСКАЯ НАСТРОЙКА RLS ПОЛИТИК
      -- ===================================

      -- 1. ПОЛИТИКИ ДЛЯ USERS
      DO $$ 
      BEGIN
        -- Политика для INSERT (регистрация)
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname = 'Users can insert own profile'
        ) THEN
          CREATE POLICY "Users can insert own profile" 
          ON users 
          FOR INSERT 
          WITH CHECK (auth.uid() = id);
        END IF;

        -- Политика для SELECT (чтение профилей)
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname = 'Users can read all profiles'
        ) THEN
          CREATE POLICY "Users can read all profiles" 
          ON users 
          FOR SELECT 
          USING (true);
        END IF;

        -- Политика для UPDATE (обновление своего профиля)
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname = 'Users can update own profile'
        ) THEN
          CREATE POLICY "Users can update own profile" 
          ON users 
          FOR UPDATE 
          USING (auth.uid() = id);
        END IF;
      END $$;

      -- 2. ПОЛИТИКИ ДЛЯ STATISTICS
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'statistics' 
          AND policyname = 'Users can insert own statistics'
        ) THEN
          CREATE POLICY "Users can insert own statistics" 
          ON statistics 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'statistics' 
          AND policyname = 'Users can read all statistics'
        ) THEN
          CREATE POLICY "Users can read all statistics" 
          ON statistics 
          FOR SELECT 
          USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'statistics' 
          AND policyname = 'Users can update own statistics'
        ) THEN
          CREATE POLICY "Users can update own statistics" 
          ON statistics 
          FOR UPDATE 
          USING (auth.uid() = user_id);
        END IF;
      END $$;
    `;

    // Выполняем SQL через RPC (Remote Procedure Call)
    const { error } = await supabase.rpc('exec_sql', { sql_query: setupSQL });

    if (error) {
      console.error('❌ Failed to setup policies via RPC:', error);
      
      // Если RPC не работает, возвращаем инструкции
      return {
        success: false,
        error: 'Please execute SQL manually in Supabase Dashboard. See START_HERE.md'
      };
    }

    console.log('✅ Database policies setup complete!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Проверяет, существуют ли необходимые RLS политики
 */
export async function checkDatabasePolicies(): Promise<{
  hasInsertPolicy: boolean;
  hasSelectPolicy: boolean;
  hasUpdatePolicy: boolean;
}> {
  try {
    // Пробуем прочитать политики через системную таблицу
    const { data, error } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .eq('tablename', 'users');

    if (error) {
      console.warn('Cannot check policies:', error);
      return {
        hasInsertPolicy: false,
        hasSelectPolicy: false,
        hasUpdatePolicy: false
      };
    }

    const policies = data || [];
    
    return {
      hasInsertPolicy: policies.some(p => p.policyname.includes('insert')),
      hasSelectPolicy: policies.some(p => p.policyname.includes('read') || p.policyname.includes('select')),
      hasUpdatePolicy: policies.some(p => p.policyname.includes('update'))
    };
    
  } catch (error) {
    console.warn('Policy check failed:', error);
    return {
      hasInsertPolicy: false,
      hasSelectPolicy: false,
      hasUpdatePolicy: false
    };
  }
}
