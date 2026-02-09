import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Swords, TrendingUp, TrendingDown, Target, Bot, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '/utils/supabase/client';
import { useAuth } from '/src/contexts/AuthContext';

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

const BOT_NAMES = [
  'БотАлекс', 'БотСофья', 'БотМаксим', 'БотАнна', 'БотДмитрий',
  'БотЕкатерина', 'БотИван', 'БотМария', 'БотАртем', 'БотОльга'
];

const BOT_LEVELS = [
  { id: 'easy', name: 'Легкий', rating: 1000, accuracy: 0.5, minDelay: 2000, maxDelay: 4000, color: 'green', icon: '🤖' },
  { id: 'medium', name: 'Средний', rating: 1300, accuracy: 0.7, minDelay: 1500, maxDelay: 3000, color: 'yellow', icon: '🤖' },
  { id: 'hard', name: 'Сложный', rating: 1600, accuracy: 0.85, minDelay: 1000, maxDelay: 2000, color: 'red', icon: '🤖' },
];

interface Problem {
  id: string;
  question: string;
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty?: number;
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string | null;
  subject_id: string;
  status: string;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
}

export function Duel() {
  const navigate = useNavigate();
  const { user, refreshUser, isLocalMode } = useAuth();
  
  const [step, setStep] = useState<'mode' | 'botLevel' | 'subject' | 'searching' | 'countdown' | 'playing' | 'finished'>('mode');
  const [gameMode, setGameMode] = useState<'pvp' | 'bot' | null>(null);
  const [botLevel, setBotLevel] = useState<typeof BOT_LEVELS[0] | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [player1Info, setPlayer1Info] = useState<any>(null);
  const [player2Info, setPlayer2Info] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);
  const [ratingChange, setRatingChange] = useState(0);
  const [botAnsweredRounds, setBotAnsweredRounds] = useState<Set<number>>(new Set());
  const [userAnsweredRounds, setUserAnsweredRounds] = useState<Set<number>>(new Set());

  // Realtime subscription
  useEffect(() => {
    if (!match) return;

    const channel = supabase
      .channel(`match:${match.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${match.id}` },
        (payload) => {
          const updatedMatch = payload.new as Match;
          setMatch(updatedMatch);

          if (updatedMatch.player2_id && step === 'searching') {
            // Противник найден
            loadMatchData(updatedMatch);
            setStep('countdown');
          }

          if (updatedMatch.status === 'finished' && step === 'playing') {
            finishMatch(updatedMatch);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id]);

  // Countdown
  useEffect(() => {
    if (step === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'countdown' && countdown === 0) {
      setStep('playing');
      setRoundStartTime(Date.now());
    }
  }, [step, countdown]);

  const loadMatchData = async (matchData: Match) => {
    // Загружаем информацию об игроках
    const { data: p1 } = await supabase
      .from('users')
      .select('*')
      .eq('id', matchData.player1_id)
      .single();
    
    const { data: p2 } = await supabase
      .from('users')
      .select('*')
      .eq('id', matchData.player2_id!)
      .single();

    setPlayer1Info(p1);
    setPlayer2Info(p2);

    // Загружаем задачи матча
    const { data: matchProblems } = await supabase
      .from('match_problems')
      .select('problem_id')
      .eq('match_id', matchData.id)
      .order('problem_order');

    if (matchProblems) {
      const problemIds = matchProblems.map(mp => mp.problem_id);
      const { data: problemsData } = await supabase
        .from('problems')
        .select('*')
        .in('id', problemIds);
      
      if (problemsData) {
        // Сортируем задачи в том же порядке, что и в match_problems
        const sortedProblems = problemIds.map(id => 
          problemsData.find(p => p.id === id)
        ).filter(Boolean) as Problem[];
        setProblems(sortedProblems);
      }
    }
  };

  const createMatch = async (subjectId: string) => {
    if (!user) return;

    // Пытаемся найти матч в ожидании
    const { data: waitingMatches } = await supabase
      .from('matches')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .neq('player1_id', user.id)
      .limit(1);

    if (waitingMatches && waitingMatches.length > 0) {
      // Присоединяемся к существующему матчу
      const existingMatch = waitingMatches[0];
      const { data: updatedMatch } = await supabase
        .from('matches')
        .update({
          player2_id: user.id,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', existingMatch.id)
        .select()
        .single();

      if (updatedMatch) {
        setMatch(updatedMatch);
        await loadMatchData(updatedMatch);
        setStep('countdown');
      }
    } else {
      // Создаем новый матч
      const { data: newMatch, error } = await supabase
        .from('matches')
        .insert({
          player1_id: user.id,
          subject_id: subjectId,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating match:', error);
        return;
      }

      setMatch(newMatch);

      // Генерируем 5 случайных задач
      const { data: allProblems } = await supabase
        .from('problems')
        .select('*')
        .eq('subject_id', subjectId);

      if (allProblems) {
        const shuffled = allProblems.sort(() => Math.random() - 0.5).slice(0, 5);
        
        // Сохраняем задачи матча
        const matchProblems = shuffled.map((p, index) => ({
          match_id: newMatch.id,
          problem_id: p.id,
          problem_order: index,
        }));

        await supabase.from('match_problems').insert(matchProblems);
      }

      setStep('searching');
    }
  };

  const handleBotLevelSelect = (level: typeof BOT_LEVELS[0]) => {
    setBotLevel(level);
    setStep('subject');
  };

  const handleModeSelect = (mode: 'pvp' | 'bot') => {
    setGameMode(mode);
    if (mode === 'bot') {
      setStep('botLevel');
    } else {
      setStep('subject');
    }
  };

  const generateBotAnswer = async (round: number) => {
    if (!match || !botLevel || !problems[round]) return;

    const currentProblem = problems[round];
    const isCorrect = Math.random() < botLevel.accuracy;

    // В локальном режиме обновляем счет напрямую в state
    if (isLocalMode) {
      const updatedMatch = {
        ...match,
        player2_score: match.player2_score + (isCorrect ? 1 : 0),
      };
      setMatch(updatedMatch);
      setBotAnsweredRounds(prev => new Set([...prev, round]));
      return;
    }

    // Supabase режим
    const currentScore = match.player2_score;

    const { data: updatedMatch } = await supabase
      .from('matches')
      .update({
        player2_score: currentScore + (isCorrect ? 1 : 0),
      })
      .eq('id', match.id)
      .select()
      .single();

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    // Добавляем раунд в список отвеченных ботом
    setBotAnsweredRounds(prev => new Set([...prev, round]));
  };

  const handleBotMatch = async (subjectId: string) => {
    if (!user || !botLevel) return;

    // Создаем новый матч без player2_id (бот - виртуальный игрок)
    const { data: newMatch, error } = await supabase
      .from('matches')
      .insert({
        player1_id: user.id,
        subject_id: subjectId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return;
    }

    setMatch(newMatch);

    // Генерируем 5 случайных задач
    const { data: allProblems } = await supabase
      .from('problems')
      .select('*')
      .eq('subject_id', subjectId);

    if (allProblems) {
      const shuffled = allProblems.sort(() => Math.random() - 0.5).slice(0, 5);
      
      // Сохраняем задачи матча
      const matchProblems = shuffled.map((p, index) => ({
        match_id: newMatch.id,
        problem_id: p.id,
        problem_order: index,
      }));

      await supabase.from('match_problems').insert(matchProblems);

      // Создаем информацию о боте (только в локальном состоянии)
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const botInfo = {
        id: 'bot',
        username: botName,
        rating: botLevel.rating,
      };

      setPlayer1Info(user);
      setPlayer2Info(botInfo);

      setProblems(shuffled);
      setStep('countdown');
    }
  };

  const handleSubjectSelectBotMode = async (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    await handleBotMatch(subject.id);
  };

  // Эффект для автоматических ответов бота
  useEffect(() => {
    if (gameMode !== 'bot' || !match || !botLevel || step !== 'playing') return;
    if (botAnsweredRounds.has(currentRound)) return;

    const delay = Math.random() * (botLevel.maxDelay - botLevel.minDelay) + botLevel.minDelay;
    
    const timer = setTimeout(async () => {
      await generateBotAnswer(currentRound);
    }, delay);

    return () => clearTimeout(timer);
  }, [gameMode, match, botLevel, step, currentRound, botAnsweredRounds]);

  const submitAnswer = async () => {
    // Используем разные функции в зависимости от режима
    if (gameMode === 'bot') {
      await submitAnswerBotMode();
    } else {
      await submitAnswerPvP();
    }
  };

  const submitAnswerPvP = async () => {
    if (!match || !user || !problems[currentRound]) return;

    const timeSpent = Math.floor((Date.now() - roundStartTime) / 1000);
    const currentProblem = problems[currentRound];
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentProblem.correct_answer.trim().toLowerCase();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // Сохраняем ответ
    await supabase.from('match_answers').insert({
      match_id: match.id,
      user_id: user.id,
      problem_id: currentProblem.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_sec: timeSpent,
    });

    // Обновляем счет
    const isPlayer1 = match.player1_id === user.id;
    const scoreField = isPlayer1 ? 'player1_score' : 'player2_score';
    const currentScore = isPlayer1 ? match.player1_score : match.player2_score;

    const { data: updatedMatch } = await supabase
      .from('matches')
      .update({
        [scoreField]: currentScore + (isCorrect ? 1 : 0),
      })
      .eq('id', match.id)
      .select()
      .single();

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    // Переходим к следующему раунду
    if (currentRound < problems.length - 1) {
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        setUserAnswer('');
        setRoundStartTime(Date.now());
      }, 2000);
    } else {
      // Завершаем матч
      await endMatch();
    }
  };

  const submitAnswerBotMode = async () => {
    if (!match || !user || !problems[currentRound]) return;

    const timeSpent = Math.floor((Date.now() - roundStartTime) / 1000);
    const currentProblem = problems[currentRound];
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = currentProblem.correct_answer.trim().toLowerCase();
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    // В локальном режиме обновляем напрямую state
    if (isLocalMode) {
      const updatedMatch = {
        ...match,
        player1_score: match.player1_score + (isCorrect ? 1 : 0),
      };
      setMatch(updatedMatch);
      setUserAnsweredRounds(prev => new Set([...prev, currentRound]));

      // Переходим к следующему раунд��
      if (currentRound < problems.length - 1) {
        setTimeout(() => {
          setCurrentRound(currentRound + 1);
          setUserAnswer('');
          setRoundStartTime(Date.now());
        }, 2000);
      } else {
        // Завершаем матч
        setTimeout(async () => {
          await endMatchBotModeLocal(updatedMatch);
        }, 2000);
      }
      return;
    }

    // Supabase режим
    // Сохраняем ответ пользователя
    await supabase.from('match_answers').insert({
      match_id: match.id,
      user_id: user.id,
      problem_id: currentProblem.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent_sec: timeSpent,
    });

    // Обновляем счет игрока 1
    const currentScore = match.player1_score;

    const { data: updatedMatch } = await supabase
      .from('matches')
      .update({
        player1_score: currentScore + (isCorrect ? 1 : 0),
      })
      .eq('id', match.id)
      .select()
      .single();

    if (updatedMatch) {
      setMatch(updatedMatch);
    }

    setUserAnsweredRounds(prev => new Set([...prev, currentRound]));

    // Переходим к следующему раунду
    if (currentRound < problems.length - 1) {
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        setUserAnswer('');
        setRoundStartTime(Date.now());
      }, 2000);
    } else {
      // Завершаем матч
      setTimeout(async () => {
        await endMatchBotMode();
      }, 2000);
    }
  };

  // Локальная версия завершения матча с ботом
  const endMatchBotModeLocal = async (finalMatch: Match) => {
    if (!user || !player1Info || !player2Info) return;

    // Определяем победителя
    let winnerId = null;
    if (finalMatch.player1_score > finalMatch.player2_score) {
      winnerId = finalMatch.player1_id;
    } else if (finalMatch.player2_score > finalMatch.player1_score) {
      winnerId = 'bot';
    }

    const finishedMatch = {
      ...finalMatch,
      status: 'finished',
      winner_id: winnerId,
    };

    setMatch(finishedMatch);

    // Вычисляем изменение рейтинга
    const K = 32;
    const player1Rating = player1Info.rating;
    const player2Rating = player2Info.rating;

    const expectedP1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));

    let actualP1;
    if (winnerId === finishedMatch.player1_id) {
      actualP1 = 1;
    } else if (winnerId === 'bot') {
      actualP1 = 0;
    } else {
      actualP1 = 0.5;
    }

    const newP1Rating = Math.round(player1Rating + K * (actualP1 - expectedP1));
    const p1Change = newP1Rating - player1Rating;

    // В локальном режиме обновляем localStorage
    const localUsersKey = 'local_users';
    const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || '[]');
    const userIndex = localUsers.findIndex((u: any) => u.id === user.id);
    
    if (userIndex >= 0) {
      localUsers[userIndex].rating = newP1Rating;
      localStorage.setItem(localUsersKey, JSON.stringify(localUsers));
    }

    // Обновляем статистику
    const localStatsKey = `local_stats_${user.id}`;
    const stats = JSON.parse(localStorage.getItem(localStatsKey) || JSON.stringify({
      total_matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      total_tasks_solved: 0,
      correct_tasks: 0,
    }));

    stats.total_matches += 1;
    if (actualP1 === 1) stats.wins += 1;
    else if (actualP1 === 0) stats.losses += 1;
    else stats.draws += 1;

    localStorage.setItem(localStatsKey, JSON.stringify(stats));

    setRatingChange(p1Change);
    await refreshUser();
    setStep('finished');
  };

  const endMatchBotMode = async () => {
    if (!match || !user || !player1Info || !player2Info) return;

    // Определяем победителя
    let winnerId = null;
    if (match.player1_score > match.player2_score) {
      winnerId = match.player1_id;
    } else if (match.player2_score > match.player1_score) {
      winnerId = 'bot';
    }

    const { data: finishedMatch } = await supabase
      .from('matches')
      .update({
        status: 'finished',
        winner_id: winnerId,
        finished_at: new Date().toISOString(),
      })
      .eq('id', match.id)
      .select()
      .single();

    if (finishedMatch) {
      setMatch(finishedMatch);
      await calculateEloAndUpdateStatsBotMode(finishedMatch);
    }
  };

  const calculateEloAndUpdateStatsBotMode = async (finishedMatch: Match) => {
    if (!user || !player1Info || !player2Info) return;

    const K = 32;
    const player1Rating = player1Info.rating;
    const player2Rating = player2Info.rating;

    // Ожидаемые результаты
    const expectedP1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));

    // Фактические результаты
    let actualP1;
    if (finishedMatch.winner_id === finishedMatch.player1_id) {
      actualP1 = 1;
    } else if (finishedMatch.winner_id === 'bot') {
      actualP1 = 0;
    } else {
      actualP1 = 0.5;
    }

    // Новый рейтинг
    const newP1Rating = Math.round(player1Rating + K * (actualP1 - expectedP1));
    const p1Change = newP1Rating - player1Rating;

    // Обновляем рейтинг
    await supabase.from('users').update({ rating: newP1Rating }).eq('id', finishedMatch.player1_id);

    // Сохраняем историю
    const reason = actualP1 === 1 ? 'match_win' : actualP1 === 0 ? 'match_loss' : 'match_draw';
    await supabase.from('rating_history').insert({
      user_id: finishedMatch.player1_id,
      match_id: finishedMatch.id,
      old_rating: player1Rating,
      new_rating: newP1Rating,
      rating_change: p1Change,
      reason,
    });

    // Обновляем статистику
    const { data: p1Stats } = await supabase.from('statistics').select('*').eq('user_id', finishedMatch.player1_id).single();

    if (p1Stats) {
      await supabase.from('statistics').update({
        total_matches: p1Stats.total_matches + 1,
        wins: p1Stats.wins + (actualP1 === 1 ? 1 : 0),
        losses: p1Stats.losses + (actualP1 === 0 ? 1 : 0),
        draws: p1Stats.draws + (actualP1 === 0.5 ? 1 : 0),
      }).eq('user_id', finishedMatch.player1_id);
    }

    setRatingChange(p1Change);
    await refreshUser();
    setStep('finished');
  };

  const handleSubjectSelect = async (subject: typeof SUBJECTS[0]) => {
    setSelectedSubject(subject);
    
    // В локальном режиме всегда используем режим бота
    if (isLocalMode) {
      console.log('🎮 Локальный режим: запуск дуэли с ботом');
      await handleBotMatchLocal(subject);
      return;
    }
    
    if (gameMode === 'bot') {
      await handleBotMatch(subject.id);
    } else {
      await createMatch(subject.id);
    }
  };

  // Локальная версия игры с ботом (без Supabase)
  const handleBotMatchLocal = async (subject: typeof SUBJECTS[0]) => {
    if (!user || !botLevel) return;

    // Создаем локальный матч
    const localMatch: Match = {
      id: `local-match-${Date.now()}`,
      player1_id: user.id,
      player2_id: 'bot',
      subject_id: subject.id,
      status: 'active',
      player1_score: 0,
      player2_score: 0,
      winner_id: null,
    };

    setMatch(localMatch);

    // Генерируем 5 случайных задач из локальных данных
    const allProblems = await loadLocalProblems(subject.id);
    const shuffled = allProblems.sort(() => Math.random() - 0.5).slice(0, 5);

    // Создаем информацию о боте
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const botInfo = {
      id: 'bot',
      username: botName,
      rating: botLevel.rating,
    };

    setPlayer1Info(user);
    setPlayer2Info(botInfo);
    setProblems(shuffled);
    setStep('countdown');
  };

  // Загрузка задач из localStorage или файлов
  const loadLocalProblems = async (subjectId: string): Promise<Problem[]> => {
    // Пытаемся загрузить из localStorage
    const cached = localStorage.getItem(`problems_${subjectId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Генерируем примеры задач
    const topics = {
      math: ['Алгебра', 'Геометрия', 'Тригонометрия'],
      physics: ['Механика', 'Электричество', 'Оптика'],
      informatics: ['Алгоритмы', 'Структуры данных', 'ООП'],
      chemistry: ['Органика', 'Неорганика', 'Физхимия'],
      biology: ['Ботаника', 'Зоология', 'Генетика'],
      geography: ['Физическая', 'Экономическая', 'Страноведение'],
      history: ['Древний мир', 'Средневековье', 'Новое время'],
      literature: ['Поэзия', 'Проза', 'Драматургия'],
      russian: ['Орфография', 'Пунктуация', 'Синтаксис'],
    };

    const problems: Problem[] = [];
    for (let i = 0; i < 15; i++) {
      const topicsList = topics[subjectId as keyof typeof topics] || ['Общие вопросы'];
      const topic = topicsList[i % topicsList.length];
      
      problems.push({
        id: `local-problem-${subjectId}-${i}`,
        question: `Пример вопроса ${i + 1} по теме "${topic}"`,
        correct_answer: `${i + 1}`,
        explanation: `Объяснение для задачи ${i + 1}`,
        topic,
        difficulty: (i % 3) + 1,
      });
    }

    // Кешируем в localStorage
    localStorage.setItem(`problems_${subjectId}`, JSON.stringify(problems));
    return problems;
  };

  const endMatch = async () => {
    if (!match || !user) return;

    // Проверяем, не завершен ли уже матч
    const { data: currentMatch } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match.id)
      .single();

    if (currentMatch && currentMatch.status !== 'finished') {
      // Определяем победителя
      let winnerId = null;
      if (currentMatch.player1_score > currentMatch.player2_score) {
        winnerId = currentMatch.player1_id;
      } else if (currentMatch.player2_score > currentMatch.player1_score) {
        winnerId = currentMatch.player2_id;
      }

      const { data: finishedMatch } = await supabase
        .from('matches')
        .update({
          status: 'finished',
          winner_id: winnerId,
          finished_at: new Date().toISOString(),
        })
        .eq('id', match.id)
        .select()
        .single();

      if (finishedMatch) {
        await calculateEloAndUpdateStats(finishedMatch);
        setMatch(finishedMatch);
      }
    } else if (currentMatch) {
      setMatch(currentMatch);
      await calculateEloAndUpdateStats(currentMatch);
    }
  };

  const calculateEloAndUpdateStats = async (finishedMatch: Match) => {
    if (!user || !player1Info || !player2Info) return;

    const K = 32;
    const player1Rating = player1Info.rating;
    const player2Rating = player2Info.rating;

    // Ожидаемые результаты
    const expectedP1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
    const expectedP2 = 1 / (1 + Math.pow(10, (player1Rating - player2Rating) / 400));

    // Фактические результаты
    let actualP1, actualP2;
    if (finishedMatch.winner_id === finishedMatch.player1_id) {
      actualP1 = 1;
      actualP2 = 0;
    } else if (finishedMatch.winner_id === finishedMatch.player2_id) {
      actualP1 = 0;
      actualP2 = 1;
    } else {
      actualP1 = 0.5;
      actualP2 = 0.5;
    }

    // Новые рейтинги
    const newP1Rating = Math.round(player1Rating + K * (actualP1 - expectedP1));
    const newP2Rating = Math.round(player2Rating + K * (actualP2 - expectedP2));

    const p1Change = newP1Rating - player1Rating;
    const p2Change = newP2Rating - player2Rating;

    // Обновляем рейтинги
    await supabase.from('users').update({ rating: newP1Rating }).eq('id', finishedMatch.player1_id);
    await supabase.from('users').update({ rating: newP2Rating }).eq('id', finishedMatch.player2_id);

    // Сохраняем историю
    const reason = actualP1 === 1 ? 'match_win' : actualP1 === 0 ? 'match_loss' : 'match_draw';
    await supabase.from('rating_history').insert([
      {
        user_id: finishedMatch.player1_id,
        match_id: finishedMatch.id,
        old_rating: player1Rating,
        new_rating: newP1Rating,
        rating_change: p1Change,
        reason,
      },
      {
        user_id: finishedMatch.player2_id,
        match_id: finishedMatch.id,
        old_rating: player2Rating,
        new_rating: newP2Rating,
        rating_change: p2Change,
        reason: actualP2 === 1 ? 'match_win' : actualP2 === 0 ? 'match_loss' : 'match_draw',
      },
    ]);

    // Обновляем статистику
    const { data: p1Stats } = await supabase.from('statistics').select('*').eq('user_id', finishedMatch.player1_id).single();
    const { data: p2Stats } = await supabase.from('statistics').select('*').eq('user_id', finishedMatch.player2_id).single();

    if (p1Stats) {
      await supabase.from('statistics').update({
        total_matches: p1Stats.total_matches + 1,
        wins: p1Stats.wins + (actualP1 === 1 ? 1 : 0),
        losses: p1Stats.losses + (actualP1 === 0 ? 1 : 0),
        draws: p1Stats.draws + (actualP1 === 0.5 ? 1 : 0),
      }).eq('user_id', finishedMatch.player1_id);
    }

    if (p2Stats) {
      await supabase.from('statistics').update({
        total_matches: p2Stats.total_matches + 1,
        wins: p2Stats.wins + (actualP2 === 1 ? 1 : 0),
        losses: p2Stats.losses + (actualP2 === 0 ? 1 : 0),
        draws: p2Stats.draws + (actualP2 === 0.5 ? 1 : 0),
      }).eq('user_id', finishedMatch.player2_id);
    }

    // Устанавливаем изменение рейтинга для текущего пользователя
    if (user.id === finishedMatch.player1_id) {
      setRatingChange(p1Change);
    } else {
      setRatingChange(p2Change);
    }

    await refreshUser();
    setStep('finished');
  };

  const finishMatch = async (updatedMatch: Match) => {
    if (updatedMatch.status === 'finished') {
      await calculateEloAndUpdateStats(updatedMatch);
    }
  };

  const cancelSearch = async () => {
    if (match) {
      await supabase.from('matches').update({ status: 'cancelled' }).eq('id', match.id);
    }
    navigate('/dashboard');
  };

  const isPlayer1 = user && match ? match.player1_id === user.id : false;
  const myScore = isPlayer1 ? match?.player1_score : match?.player2_score;
  const opponentScore = isPlayer1 ? match?.player2_score : match?.player1_score;
  const isWinner = match?.winner_id === user?.id;
  const isDraw = match?.winner_id === null && match?.status === 'finished';

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
          <Swords className="w-10 h-10 text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-800">PvP Дуэль</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Выбор режима */}
        {step === 'mode' && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Выберите режим игры</h2>
            <p className="text-gray-600 text-center mb-8">Выберите режим для дуэли</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => handleModeSelect('pvp')}
                className="bg-white border border-gray-100 rounded-xl shadow-md p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-center mb-4"><Users className="w-16 h-16 text-blue-400" /></div>
                <h3 className="text-2xl font-bold text-center text-gray-800">Против игрока</h3>
                <p className="text-gray-600 text-center mt-2">PvP режим</p>
              </div>
              <div
                onClick={() => handleModeSelect('bot')}
                className="bg-white border border-gray-100 rounded-xl shadow-md p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="flex justify-center mb-4"><Bot className="w-16 h-16 text-sky-400" /></div>
                <h3 className="text-2xl font-bold text-center text-gray-800">Против бота</h3>
                <p className="text-gray-600 text-center mt-2">PvB режим</p>
              </div>
            </div>
          </div>
        )}

        {/* Выбор уровня бота */}
        {step === 'botLevel' && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Выберите уровень бота</h2>
            <p className="text-gray-600 text-center mb-8">Выберите сложность вашего противника</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BOT_LEVELS.map((level) => (
                <div
                  key={level.id}
                  onClick={() => handleBotLevelSelect(level)}
                  className="bg-white border border-gray-100 rounded-xl shadow-md p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="text-6xl mb-4 text-center">{level.icon}</div>
                  <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{level.name}</h3>
                  <p className="text-center text-gray-600 mb-3">Рейтинг: {level.rating}</p>
                  <p className="text-sm text-center text-gray-500">
                    {level.id === 'easy' && 'Точность ~50%'}
                    {level.id === 'medium' && 'Точность ~70%'}
                    {level.id === 'hard' && 'Точность ~85%'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Выбор предмета */}
        {step === 'subject' && (
          <div>
            <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Выберите предмет</h2>
            <p className="text-gray-600 text-center mb-8">Выберите предмет для PvP дуэли</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBJECTS.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  className="bg-white border border-gray-100 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="text-5xl mb-4 text-center">{subject.icon}</div>
                  <h3 className="text-xl font-bold text-center text-gray-800">{subject.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Поиск противника */}
        {step === 'searching' && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8 text-gray-800">Поиск противника...</h2>
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-blue-200 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 border-8 border-sky-200 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 border-8 border-blue-300 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
            <p className="text-gray-600 mb-8">Ищем достойного соперника...</p>
            <button
              onClick={cancelSearch}
              className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-medium transition-all border border-gray-200"
            >
              Отменить поиск
            </button>
          </div>
        )}

        {/* Countdown */}
        {step === 'countdown' && (
          <div className="flex items-center justify-center">
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 1 }}
              className="text-9xl font-bold text-blue-400"
            >
              {countdown === 0 ? 'ПОЕХАЛИ!' : countdown}
            </motion.div>
          </div>
        )}

        {/* Игра */}
        {step === 'playing' && problems[currentRound] && player1Info && player2Info && (
          <div>
            {/* Индикаторы игроков */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-100 rounded-xl shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center text-white font-bold">
                    {player1Info.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{player1Info.username}</p>
                    <p className="text-sm text-gray-600">{player1Info.rating}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-center text-blue-400">{match?.player1_score}</div>
              </div>

              <div className="bg-gradient-to-r from-blue-400 to-sky-400 rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-white">
                <p className="font-bold text-2xl mb-1">VS</p>
                <p className="text-sm">Раунд {currentRound + 1} из 5</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl shadow-md p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {player2Info.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{player2Info.username}</p>
                    <p className="text-sm text-gray-600">{player2Info.rating}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-center text-sky-400">{match?.player2_score}</div>
              </div>
            </div>

            {/* Задача */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-8">
              <div className="mb-6">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  {problems[currentRound].topic}
                </span>
              </div>

              <p className="text-xl text-gray-800 mb-6 leading-relaxed">{problems[currentRound].question}</p>

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && submitAnswer()}
                className="w-full border border-gray-300 rounded-xl px-6 py-4 text-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 mb-6"
                placeholder="Введите ваш ответ"
                autoFocus
              />

              <button
                onClick={submitAnswer}
                disabled={!userAnswer.trim()}
                className="w-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Отправить ответ
              </button>
            </div>
          </div>
        )}

        {/* Результаты */}
        {step === 'finished' && match && player1Info && player2Info && (
          <div className={`bg-white border ${isWinner ? 'border-blue-300' : isDraw ? 'border-gray-300' : 'border-gray-300'} rounded-2xl shadow-md p-8`}>
            <div className="text-center mb-8">
              {isWinner ? (
                <>
                  <Trophy className="w-32 h-32 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-5xl font-bold text-blue-400 mb-2">Победа!</h2>
                </>
              ) : isDraw ? (
                <>
                  <Target className="w-32 h-32 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-5xl font-bold text-gray-600 mb-2">Ничья</h2>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                    <div className="text-8xl">😔</div>
                  </div>
                  <h2 className="text-5xl font-bold text-gray-600 mb-2">Поражение</h2>
                </>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-8 mb-8 border border-gray-100">
              <div className="text-center mb-6">
                <p className="text-6xl font-bold text-gray-800 mb-2">
                  {myScore} : {opponentScore}
                </p>
                <p className="text-gray-600">Финальный счет</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                {ratingChange > 0 ? (
                  <TrendingUp className="w-12 h-12 text-blue-400" />
                ) : ratingChange < 0 ? (
                  <TrendingDown className="w-12 h-12 text-gray-400" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-3xl">—</div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Изменение рейтинга</p>
                  <p className={`text-4xl font-bold ${ratingChange > 0 ? 'text-blue-400' : ratingChange < 0 ? 'text-gray-500' : 'text-gray-600'}`}>
                    {ratingChange > 0 ? '+' : ''}{ratingChange}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Новый рейтинг</p>
                <p className="text-4xl font-bold text-blue-400">
                  {user && ((isPlayer1 ? player1Info.rating : player2Info.rating) + ratingChange)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all border border-gray-200"
              >
                Вернуться на главную
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Реванш
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}