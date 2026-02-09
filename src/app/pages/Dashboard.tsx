import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Trophy, LogOut, Zap, Swords, BarChart3, CheckCircle, Target, TrendingUp, Crown, Star, Settings } from 'lucide-react';
import { useAuth } from '/src/contexts/AuthContext';
import { supabase } from '/utils/supabase/client';
import { motion } from 'motion/react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, stats, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (data?.is_admin) {
      setIsAdmin(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm py-6 px-8 shadow-md border-b border-gray-100 relative"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Trophy className="w-10 h-10 text-blue-400 drop-shadow-sm" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">ОлимпИУМ</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all border border-gray-200 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            Выход
          </motion.button>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Профиль пользователя */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-md p-8 mb-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Колонка 1: Профиль */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-white text-3xl font-bold shadow-md ring-4 ring-white"
              >
                {user.username.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </motion.div>

            {/* Колонка 2: Рейтинг */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl p-4 border border-blue-100"
            >
              <div className="relative">
                <Crown className="w-8 h-8 text-blue-400 mb-2" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Рейтинг Elo</p>
              <p className="text-4xl font-bold text-blue-400">
                {user.rating}
              </p>
              <span className="bg-blue-400 text-white px-3 py-1 rounded-full text-sm font-medium mt-2 shadow-sm">
                Уровень {user.level}
              </span>
            </motion.div>

            {/* Колонка 3: Статистика */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center bg-sky-50 rounded-2xl p-4 border border-sky-100"
            >
              <Target className="w-8 h-8 text-sky-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Решено задач</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.correct_tasks || 0} / {stats?.total_tasks_solved || 0}
              </p>
              {stats && stats.total_tasks_solved > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((stats.correct_tasks / stats.total_tasks_solved) * 100)}% точность
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Выбор режима */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
        >
          Выберите режим
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Тре��ировка */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => navigate('/training')}
            className="bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-sky-50/0 group-hover:from-blue-50 group-hover:to-sky-50 transition-all duration-300" />
            
            <div className="relative z-10">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Zap className="w-16 h-16 text-blue-400 mb-4" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Тренировка</h3>
              <p className="text-gray-600 mb-4">Решай задачи в своем темпе</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  9 предметов на выбор
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  135 задач разной сложности
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  Подробные объяснения
                </li>
              </ul>
            </div>
          </motion.div>

          {/* PvP Дуэль */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => navigate('/duel')}
            className="bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-blue-50/0 group-hover:from-sky-50 group-hover:to-blue-50 transition-all duration-300" />
            
            <div className="relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Swords className="w-16 h-16 text-sky-400 mb-4" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">PvP Дуэль</h3>
              <p className="text-gray-600 mb-4">Соревнуйся с другими игроками</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-sky-400" />
                  Соревнуйся с другими
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-sky-400" />
                  Система Elo-рейтинга
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-sky-400" />
                  Рост в турнирной таблице
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Аналитика */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => navigate('/analytics')}
          className="bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-sky-50/0 group-hover:from-blue-50 group-hover:to-sky-50 transition-all duration-300" />
          
          <div className="flex items-center gap-6 relative z-10">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <BarChart3 className="w-16 h-16 text-blue-400" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Аналитика</h3>
              <p className="text-gray-600">Отслеживай свой прогресс и достижения</p>
            </div>
            <TrendingUp className="w-12 h-12 text-sky-400 opacity-50" />
          </div>
        </motion.div>

        {/* Панель администратора */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => navigate('/admin')}
            className="bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-pink-50/0 group-hover:from-purple-50 group-hover:to-pink-50 transition-all duration-300" />
            
            <div className="flex items-center gap-6 relative z-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Settings className="w-16 h-16 text-purple-400" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-gray-800">Администрирование</h3>
                  <span className="bg-purple-400 text-white px-3 py-1 rounded-full text-xs font-medium">ADMIN</span>
                </div>
                <p className="text-gray-600">Управление задачами, пользователями и данными</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}