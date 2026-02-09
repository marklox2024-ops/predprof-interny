import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, Target, Trophy, XCircle, Minus, Award, Star } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '/utils/supabase/client';
import { useAuth } from '/src/contexts/AuthContext';
import { motion } from 'motion/react';

export function Analytics() {
  const navigate = useNavigate();
  const { user, stats } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'rating' | 'subjects' | 'general'>('rating');
  const [ratingHistory, setRatingHistory] = useState<any[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    // Загружаем историю рейтинга
    const { data: ratingData } = await supabase
      .from('rating_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at');

    if (ratingData) {
      const formattedRating = ratingData.map((r, index) => ({
        index: index + 1,
        rating: r.new_rating,
        date: new Date(r.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
      }));
      setRatingHistory(formattedRating);
    }

    // Загружаем статистику по предметам
    const { data: attempts } = await supabase
      .from('task_attempts')
      .select('problem_id, is_correct')
      .eq('user_id', user.id);

    if (attempts) {
      const { data: problems } = await supabase
        .from('problems')
        .select('id, subject_id');

      if (problems) {
        const subjectMap: any = {};
        
        attempts.forEach(attempt => {
          const problem = problems.find(p => p.id === attempt.problem_id);
          if (problem) {
            if (!subjectMap[problem.subject_id]) {
              subjectMap[problem.subject_id] = { total: 0, correct: 0 };
            }
            subjectMap[problem.subject_id].total++;
            if (attempt.is_correct) {
              subjectMap[problem.subject_id].correct++;
            }
          }
        });

        const SUBJECT_NAMES: any = {
          math: 'Математика',
          physics: 'Физика',
          informatics: 'Информатика',
          chemistry: 'Химия',
          biology: 'Биология',
          geography: 'География',
          history: 'История',
          literature: 'Литература',
          russian: 'Русский язык',
        };

        const subjectStatsArray = Object.entries(subjectMap).map(([subjectId, data]: [string, any]) => ({
          subject: SUBJECT_NAMES[subjectId] || subjectId,
          percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        }));

        setSubjectStats(subjectStatsArray);
      }
    }
  };

  if (!user || !stats) return null;

  const pieData = [
    { name: 'Победы', value: stats.wins, color: '#60a5fa' },
    { name: 'Поражения', value: stats.losses, color: '#93c5fd' },
    { name: 'Ничьи', value: stats.draws, color: '#dbeafe' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm py-6 px-8 shadow-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-all border border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Аналитика</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('rating')}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              activeTab === 'rating'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            История рейтинга
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              activeTab === 'subjects'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Прогресс по предметам
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-4 rounded-xl font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            Общая статистика
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'rating' && (
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">История рейтинга</h2>
            {ratingHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ratingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#60a5fa' }}
                    name="Рейтинг"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Сыграйте матчи, чтобы увидеть историю рейтинга</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Прогресс по предметам</h2>
            {subjectStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="subject" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: any) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="percentage" name="Процент правильных" radius={[8, 8, 0, 0]}>
                    {subjectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#60a5fa" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Решите задачи, чтобы увидеть прогресс по предметам</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'general' && (
          <div>
            {/* Grid статистики */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <Trophy className="w-12 h-12 text-blue-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Всего матчей</p>
                <p className="text-4xl font-bold text-gray-800">{stats.total_matches}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <TrendingUp className="w-12 h-12 text-blue-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Побед</p>
                <p className="text-4xl font-bold text-blue-400">{stats.wins}</p>
                {stats.total_matches > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round((stats.wins / stats.total_matches) * 100)}% винрейт
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <XCircle className="w-12 h-12 text-sky-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Поражений</p>
                <p className="text-4xl font-bold text-sky-400">{stats.losses}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <Minus className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Ничьих</p>
                <p className="text-4xl font-bold text-gray-600">{stats.draws}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <Target className="w-12 h-12 text-blue-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Решено задач</p>
                <p className="text-4xl font-bold text-blue-400">{stats.total_tasks_solved}</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <TrendingUp className="w-12 h-12 text-sky-400 mb-4" />
                <p className="text-sm text-gray-600 mb-1">Правильных ответов</p>
                <p className="text-4xl font-bold text-sky-400">{stats.correct_tasks}</p>
                {stats.total_tasks_solved > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round((stats.correct_tasks / stats.total_tasks_solved) * 100)}% точность
                  </p>
                )}
              </div>
            </div>

            {/* Pie Chart */}
            {stats.total_matches > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Распределение результатов матчей</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}