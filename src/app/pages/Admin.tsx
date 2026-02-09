import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Trash2, Users, FileDown, FileUp, Database, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '/utils/supabase/client';
import { useAuth } from '/src/contexts/AuthContext';
import { motion } from 'motion/react';

// Edge Functions удалены - используем прямые запросы к Supabase

const SUBJECTS = [
  { id: 'math', name: 'Математика', icon: '📐' },
  { id: 'physics', name: 'Физика', icon: '⚛️' },
  { id: 'informatics', name: 'Информатика', icon: '💻' },
  { id: 'chemistry', name: 'Химия', icon: '🧪' },
  { id: 'biology', name: 'Биология', icon: '🧬' },
  { id: 'geography', name: 'География', icon: '🌍' },
  { id: 'history', name: 'История', icon: '📜' },
  { id: 'literature', name: 'Литература', icon: '📚' },
  { id: 'russian', name: 'Русский язык', icon: '✏️' },
];

interface Problem {
  id: string;
  subject_id: string;
  topic: string;
  difficulty: number;
  question: string;
  correct_answer: string;
  explanation: string;
}

interface UserStats {
  id: string;
  email: string;
  username: string;
  rating: number;
  level: number;
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  total_tasks_solved: number;
  correct_tasks: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'problems' | 'users' | 'import'>('problems');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  
  // Диагностика удалена - Edge Functions больше не используются

  const [formData, setFormData] = useState({
    subject_id: 'math',
    topic: '',
    difficulty: 1,
    question: '',
    correct_answer: '',
    explanation: '',
  });

  useEffect(() => {
    loadProblems();
    loadUsers();
  }, []);

  const loadProblems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('subject_id')
      .order('difficulty')
      .order('topic');
    
    if (error) {
      setMessage({ type: 'error', text: 'Ошибка загрузки задач' });
      console.error(error);
    } else {
      setProblems(data || []);
    }
    setIsLoading(false);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Загружаем пользователей напрямую из Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Загружаем статистику
      const { data: statsData, error: statsError } = await supabase
        .from('statistics')
        .select('*');
      
      if (statsError) throw statsError;
      
      // Объединяем данные
      const combinedData = (usersData || []).map(user => {
        const stats = (statsData || []).find(s => s.user_id === user.id);
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          rating: user.rating || 1200,
          level: user.level || 1,
          total_matches: stats?.total_matches || 0,
          wins: stats?.wins || 0,
          losses: stats?.losses || 0,
          draws: stats?.draws || 0,
          total_tasks_solved: stats?.total_tasks_solved || 0,
          correct_tasks: stats?.correct_tasks || 0,
        };
      });
      
      console.log('Load users - Data loaded:', combinedData.length, 'users');
      setUsers(combinedData);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: 'Ошибка загрузки пользователей: ' + errorMsg });
      console.error('Load users - Error:', error);
    }
    setIsLoading(false);
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingProblem) {
        // Обновление через Supabase
        const { error } = await supabase
          .from('problems')
          .update(formData)
          .eq('id', editingProblem.id);

        if (error) throw error;

        setMessage({ type: 'success', text: 'Задача успешно обновлена' });
        setEditingProblem(null);
        resetForm();
        loadProblems();
      } else {
        // Создание через Supabase
        const { error } = await supabase
          .from('problems')
          .insert([formData]);

        if (error) throw error;

        setMessage({ type: 'success', text: 'Задача успешно создана' });
        resetForm();
        loadProblems();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Submit problem - Error:', errorMessage, error);
      setMessage({ 
        type: 'error', 
        text: `${editingProblem ? 'Ошибка обновления' : 'Ошибка создания'}: ${errorMessage}` 
      });
    }
    setIsLoading(false);
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setFormData({
      subject_id: problem.subject_id,
      topic: problem.topic,
      difficulty: problem.difficulty,
      question: problem.question,
      correct_answer: problem.correct_answer,
      explanation: problem.explanation,
    });
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    
    setIsLoading(true);
    try {
      // Удаление через Supabase
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Задача успешно удалена' });
      loadProblems();
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка удаления задачи' });
      console.error(error);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      subject_id: 'math',
      topic: '',
      difficulty: 1,
      question: '',
      correct_answer: '',
      explanation: '',
    });
    setEditingProblem(null);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(problems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `problems_${new Date().toISOString()}.json`;
    link.click();
    setMessage({ type: 'success', text: 'JSON успешно экспортирован' });
  };

  const handleExportCSV = () => {
    const headers = ['subject_id', 'topic', 'difficulty', 'question', 'correct_answer', 'explanation'];
    const csvContent = [
      headers.join(','),
      ...problems.map(p => [
        p.subject_id,
        `"${p.topic.replace(/"/g, '""')}"`,
        p.difficulty,
        `"${p.question.replace(/"/g, '""')}"`,
        `"${p.correct_answer.replace(/"/g, '""')}"`,
        `"${p.explanation.replace(/"/g, '""')}"`,
      ].join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `problems_${new Date().toISOString()}.csv`;
    link.click();
    setMessage({ type: 'success', text: 'CSV успешно экспортирован' });
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const problemsToImport = Array.isArray(json) ? json : [json];
        
        setIsLoading(true);
        const { error } = await supabase
          .from('problems')
          .insert(problemsToImport.map(p => ({
            subject_id: p.subject_id,
            topic: p.topic,
            difficulty: p.difficulty,
            question: p.question,
            correct_answer: p.correct_answer,
            explanation: p.explanation,
          })));
        
        if (error) {
          setMessage({ type: 'error', text: 'Ошибка импорта JSON' });
          console.error(error);
        } else {
          setMessage({ type: 'success', text: `Импортировано задач: ${problemsToImport.length}` });
          loadProblems();
        }
        setIsLoading(false);
      } catch (err) {
        setMessage({ type: 'error', text: 'Неверный формат JSON' });
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const problemsToImport = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
            const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
            
            return {
              subject_id: cleanValues[0],
              topic: cleanValues[1],
              difficulty: parseInt(cleanValues[2]),
              question: cleanValues[3],
              correct_answer: cleanValues[4],
              explanation: cleanValues[5],
            };
          });
        
        setIsLoading(true);
        const { error } = await supabase
          .from('problems')
          .insert(problemsToImport);
        
        if (error) {
          setMessage({ type: 'error', text: 'Ошибка импорта CSV' });
          console.error(error);
        } else {
          setMessage({ type: 'success', text: `Импортировано задач: ${problemsToImport.length}` });
          loadProblems();
        }
        setIsLoading(false);
      } catch (err) {
        setMessage({ type: 'error', text: 'Неверный формат CSV' });
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm py-6 px-8 shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-all border border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Database className="w-10 h-10 text-purple-400" />
          <h1 className="text-3xl font-bold text-gray-800">Администрирование</h1>
          <span className="bg-purple-400 text-white px-3 py-1 rounded-full text-xs font-medium">ADMIN</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-7xl mx-auto mt-6 px-6`}
        >
          <div className={`${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-xl px-4 py-3 flex items-center gap-2`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Welcome Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mt-6 px-6"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-blue-800 mb-1">Панель администратора</h3>
              <p className="text-sm text-blue-700">
                Управляйте задачами, просматривайте статистику пользователей и импортируйте/экспортируйте данные в JSON или CSV формате.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Diagnostics Panel */}
      {diagnostics && showDiagnostics && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mt-4 px-6"
        >
          <div className={`${
            diagnostics.checkResponse?.isAdmin 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          } border rounded-xl px-4 py-3`}>
            <div className="flex items-start gap-3">
              {diagnostics.checkResponse?.isAdmin ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold ${
                    diagnostics.checkResponse?.isAdmin ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Диагностика доступа
                  </h3>
                  <button
                    onClick={() => setShowDiagnostics(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Скрыть
                  </button>
                </div>
                <div className={`text-sm space-y-1 ${
                  diagnostics.checkResponse?.isAdmin ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>✓ Сессия: {diagnostics.hasSession ? 'Активна' : '❌ Отсутствует'}</p>
                  <p>✓ Access Token: {diagnostics.hasToken ? 'Присутствует' : '❌ Отсутствует'}</p>
                  <p>✓ User ID: {diagnostics.userId}</p>
                  <p>✓ Email: {diagnostics.userEmail}</p>
                  {diagnostics.checkResponse && (
                    <>
                      <p>✓ Статус проверки: {diagnostics.checkStatus}</p>
                      <p className="font-bold">
                        ✓ Права администра��ора: {diagnostics.checkResponse.isAdmin ? '✅ Есть' : '❌ Отсутствуют'}
                      </p>
                      {!diagnostics.checkResponse.isAdmin && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <p className="font-bold text-red-900 mb-2">❌ У вас нет прав администратора!</p>
                          <p className="text-sm text-red-800 mb-2">
                            В базе данных is_admin = true, но токен не обнвлен. 
                            <strong> Вы должны выйти и войти заново!</strong>
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await supabase.auth.signOut();
                                navigate('/');
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              🔓 Выйти сейчас
                            </button>
                            <button
                              onClick={checkAdminStatus}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              🔄 Обновить статус
                            </button>
                          </div>
                          <details className="mt-3">
                            <summary className="text-sm text-red-800 font-medium cursor-pointer hover:text-red-900">
                              📋 Показать SQL-запрос (если нужно)
                            </summary>
                            <pre className="text-xs bg-red-200 p-2 rounded overflow-x-auto mt-2">
{`-- 1. Добавьте колонку is_admin
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Назначьте права администратора (замените email!)
UPDATE users SET is_admin = TRUE WHERE email = '${diagnostics.userEmail}';

-- 3. Проверьте результат
SELECT id, email, is_admin FROM users WHERE email = '${diagnostics.userEmail}';`}
                            </pre>
                          </details>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'problems'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Database className="w-5 h-5" />
            Управление задачами
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Статистика пользователей
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'import'
                ? 'bg-blue-400 text-white shadow-md shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <FileUp className="w-5 h-5" />
            Импорт/Экспорт
          </button>
        </div>

        {/* Tab Content: Управление задачами */}
        {activeTab === 'problems' && (
          <div>
            {/* Форма добавления/редактирования */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingProblem ? 'Редактировать задачу' : 'Добавить новую задачу'}
              </h2>
              <form onSubmit={handleSubmitProblem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Предмет
                    </label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      required
                    >
                      {SUBJECTS.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.icon} {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тема
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Сложность (1-3)
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      required
                    >
                      <option value={1}>1 - Легкий</option>
                      <option value={2}>2 - Средний</option>
                      <option value={3}>3 - Сложный</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Правильный ответ
                    </label>
                    <input
                      type="text"
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Вопрос
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Объяснение
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white px-6 py-3 rounded-xl font-medium shadow-md disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    {editingProblem ? 'Обновить задачу' : 'Добавить задачу'}
                  </button>
                  {editingProblem && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Список задач */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Все задачи ({problems.length})
              </h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  {problems.map((problem) => (
                    <div key={problem.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                              {SUBJECTS.find(s => s.id === problem.subject_id)?.name}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              problem.difficulty === 1 ? 'bg-green-50 text-green-600 border border-green-200' :
                              problem.difficulty === 2 ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                              'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                              Уровень {problem.difficulty}
                            </span>
                            <span className="text-sm text-gray-600">{problem.topic}</span>
                          </div>
                          <p className="text-gray-800 font-medium mb-1">{problem.question}</p>
                          <p className="text-sm text-gray-600">Ответ: <span className="font-medium">{problem.correct_answer}</span></p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditProblem(problem)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProblem(problem.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Статистика пользователей */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Статистика пользователей ({users.length})
            </h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Пользователь</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Рейтинг</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Матчи</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">В/П/Н</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Задачи</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Точность</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{user.username}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                            {user.rating}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{user.total_matches}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <span className="text-green-600">{user.wins}</span> / 
                          <span className="text-red-600"> {user.losses}</span> / 
                          <span className="text-gray-600"> {user.draws}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {user.correct_tasks} / {user.total_tasks_solved}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.total_tasks_solved > 0 ? (
                            <span className="font-medium text-gray-800">
                              {Math.round((user.correct_tasks / user.total_tasks_solved) * 100)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Импорт/Экспорт */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Экспорт */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Экспорт задач
              </h2>
              <p className="text-gray-600 mb-6">
                Скачайте все задачи в формате JSON или CSV
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white px-6 py-3 rounded-xl font-medium shadow-md"
                >
                  <FileDown className="w-5 h-5" />
                  Экспорт в JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200"
                >
                  <FileDown className="w-5 h-5" />
                  Экспорт в CSV
                </button>
              </div>
            </div>

            {/* Импорт */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Импорт задач
              </h2>
              <p className="text-gray-600 mb-6">
                Загрузите задачи из файла JSON или CSV
              </p>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-6 py-3 rounded-xl font-medium border border-blue-200 cursor-pointer w-fit">
                    <FileUp className="w-5 h-5" />
                    Импорт из JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-600 px-6 py-3 rounded-xl font-medium border border-sky-200 cursor-pointer w-fit">
                    <FileUp className="w-5 h-5" />
                    Импорт из CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Формат CSV:</h3>
                <code className="text-sm text-gray-700">
                  subject_id,topic,difficulty,question,correct_answer,explanation
                </code>
                <h3 className="font-bold text-gray-800 mb-2 mt-4">Формат JSON:</h3>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`[
  {
    "subject_id": "math",
    "topic": "Алгебра",
    "difficulty": 1,
    "question": "Сколько будет 2+2?",
    "correct_answer": "4",
    "explanation": "Это простое сложение"
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}