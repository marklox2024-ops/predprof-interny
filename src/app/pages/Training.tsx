import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, CheckCircle, XCircle, Lightbulb, Clock, Target, Sparkles } from 'lucide-react';
import { supabase } from '/utils/supabase/client';
import { useAuth } from '/src/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const SUBJECTS = [
  { id: 'math', name: 'Математика', icon: '📐', color: 'blue' },
  { id: 'physics', name: 'Физика', icon: '⚛️', color: 'purple' },
  { id: 'informatics', name: 'Информатика', icon: '💻', color: 'green' },
  { id: 'chemistry', name: 'Химия', icon: '🧪', color: 'pink' },
  { id: 'biology', name: 'Биология', icon: '🧬', color: 'emerald' },
  { id: 'geography', name: 'География', icon: '🌍', color: 'teal' },
  { id: 'history', name: 'История', icon: '📜', color: 'amber' },
  { id: 'literature', name: 'Литература', icon: '📚', color: 'rose' },
  { id: 'russian', name: 'Русский язык', icon: '✏️', color: 'indigo' },
];

const DIFFICULTIES = [
  { level: 1, name: 'Легкий', color: 'green', description: '1-3 балла' },
  { level: 2, name: 'Средний', color: 'yellow', description: '4-6 баллов' },
  { level: 3, name: 'Сложный', color: 'red', description: '7-10 баллов' },
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

export function Training() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [step, setStep] = useState<'subject' | 'difficulty' | 'solving' | 'result' | 'summary'>('subject');
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<{ problem: Problem; userAnswer: string; isCorrect: boolean; timeSpent: number }[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (step === 'solving' && problems.length > 0) {
      setStartTime(Date.now());
    }
  }, [currentProblemIndex, step]);

  const loadProblems = async (subjectId: string, difficulty: number) => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('difficulty', difficulty);

    if (error) {
      console.error('Error loading problems:', error);
      return;
    }

    // Перемешиваем и берем 5 случайных задач
    const shuffled = data.sort(() => Math.random() - 0.5);
    setProblems(shuffled.slice(0, 5));
    setStep('solving');
  };

  const handleSubjectSelect = (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    setStep('difficulty');
  };

  const handleDifficultySelect = async (difficulty: number) => {
    setSelectedDifficulty(difficulty);
    if (selectedSubject) {
      await loadProblems(selectedSubject.id, difficulty);
    }
  };

  const checkAnswer = async () => {
    const currentProblem = problems[currentProblemIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Нормализуем ответы для сравнения
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentProblem.correct_answer.trim().toLowerCase();
    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    
    setIsCorrect(correct);

    // Сохраняем попытку
    if (user) {
      await supabase.from('task_attempts').insert({
        user_id: user.id,
        problem_id: currentProblem.id,
        user_answer: userAnswer,
        is_correct: correct,
        time_spent_sec: timeSpent,
      });

      // Обновляем статистику
      const { data: stats } = await supabase
        .from('statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stats) {
        await supabase
          .from('statistics')
          .update({
            total_tasks_solved: stats.total_tasks_solved + 1,
            correct_tasks: stats.correct_tasks + (correct ? 1 : 0),
          })
          .eq('user_id', user.id);
      }
    }

    setAnswers([...answers, { problem: currentProblem, userAnswer, isCorrect: correct, timeSpent }]);
    setStep('result');
  };

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setUserAnswer('');
      setIsCorrect(null);
      setStep('solving');
    } else {
      refreshUser();
      setStep('summary');
    }
  };

  const restartTraining = () => {
    setStep('subject');
    setSelectedSubject(null);
    setSelectedDifficulty(null);
    setProblems([]);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setIsCorrect(null);
    setAnswers([]);
  };

  const currentProblem = problems[currentProblemIndex];
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalTime = Math.floor((Date.now() - sessionStartTime) / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm py-6 px-8 shadow-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg transition-all border border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Target className="w-10 h-10 text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-800">Тренировка</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Шаг 1: Выбор предмета */}
        {step === 'subject' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-bold text-center mb-4"
            >
              Выберите предмет
            </motion.h2>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-center mb-8"
            >
              Выберите предмет для тренировки
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBJECTS.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubjectSelect(subject)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-400"
                >
                  <div className="text-5xl mb-4 text-center">
                    {subject.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900">{subject.name}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Шаг 2: Выбор сложности */}
        {step === 'difficulty' && selectedSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-center mb-2">Выберите сложность</h2>
            <p className="text-gray-600 text-center mb-8">{selectedSubject.name}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleDifficultySelect(1)}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <Star className="w-8 h-8 text-green-600 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Легкий</h3>
                <p className="text-gray-600 text-center">1-3 балла</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleDifficultySelect(2)}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <Star className="w-8 h-8 text-yellow-600 fill-current" />
                  <Star className="w-8 h-8 text-yellow-600 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Средний</h3>
                <p className="text-gray-600 text-center">4-6 баллов</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleDifficultySelect(3)}
                className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-center mb-4">
                  <Star className="w-8 h-8 text-red-600 fill-current" />
                  <Star className="w-8 h-8 text-red-600 fill-current" />
                  <Star className="w-8 h-8 text-red-600 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Сложный</h3>
                <p className="text-gray-600 text-center">7-10 баллов</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Шаг 3: Решение задачи */}
        {step === 'solving' && currentProblem && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-900">
                Задача {currentProblemIndex + 1} из {problems.length}
              </span>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{Math.floor((Date.now() - startTime) / 1000)} сек</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                {selectedDifficulty === 1 && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Легкий · {currentProblem.topic}
                  </span>
                )}
                {selectedDifficulty === 2 && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                    Средний · {currentProblem.topic}
                  </span>
                )}
                {selectedDifficulty === 3 && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    Сложный · {currentProblem.topic}
                  </span>
                )}
              </div>

              <p className="text-xl text-gray-800 mb-6 leading-relaxed">{currentProblem.question}</p>

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                placeholder="Введите ваш ответ"
                autoFocus
              />

              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Проверить ответ
              </button>
            </div>
          </div>
        )}

        {/* Шаг 4: Результат ответа */}
        {step === 'result' && currentProblem && isCorrect !== null && (
          <div className={`bg-gradient-to-br ${isCorrect ? 'from-green-50 to-emerald-50 border-green-500' : 'from-red-50 to-rose-50 border-red-500'} border-4 rounded-2xl p-8`}>
            <div className="text-center mb-6">
              {isCorrect ? (
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
              )}
              <h2 className={`text-4xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Правильно!' : 'Неправильно'}
              </h2>
            </div>

            {!isCorrect && (
              <div className="bg-white rounded-xl p-6 mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>Ваш ответ:</strong> {userAnswer}
                </p>
                <p className="text-gray-700">
                  <strong>Правильный ответ:</strong> {currentProblem.correct_answer}
                </p>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Объяснение:</h3>
                  <p className="text-blue-800">{currentProblem.explanation}</p>
                </div>
              </div>
            </div>

            <button
              onClick={nextProblem}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {currentProblemIndex < problems.length - 1 ? 'Следующая задача' : 'Завершить тренировку'}
            </button>
          </div>
        )}

        {/* Шаг 5: Итоги */}
        {step === 'summary' && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-8">Тренировка завершена!</h2>
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Правильных ответов</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {correctCount} / {answers.length}
                  </p>
                </div>

                <div className="text-center">
                  <Target className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Процент успеха</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {Math.round((correctCount / answers.length) * 100)}%
                  </p>
                </div>

                <div className="text-center">
                  <Clock className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Потраченное время</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Вернуться на главную
                </button>
                <button
                  onClick={restartTraining}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Начать новую тренировку
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}