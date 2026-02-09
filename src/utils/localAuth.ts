// Локальная система авторизации (без Supabase)
// Используется как fallback когда Supabase недоступен

export interface LocalUser {
  id: string;
  email: string;
  username: string;
  rating: number;
  level: number;
  password?: string; // Хранится только для проверки в demo режиме
}

export interface LocalStats {
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  total_tasks_solved: number;
  correct_tasks: number;
}

// Демо-аккаунты для локального режима
export const DEMO_USERS: LocalUser[] = [
  {
    id: 'demo-student-001',
    email: 'demo_student@olimpium.ru',
    username: 'Демо Ученик',
    rating: 1200,
    level: 1,
    password: 'demo123456',
  },
  {
    id: 'demo-advanced-001',
    email: 'demo_advanced@olimpium.ru',
    username: 'Продвинутый Олимпиец',
    rating: 1500,
    level: 5,
    password: 'demo123456',
  },
  {
    id: 'demo-master-001',
    email: 'demo@demo.com',
    username: 'Тестовый Пользователь',
    rating: 1800,
    level: 10,
    password: 'demo',
  },
];

// Статистика для демо-аккаунтов
export const DEMO_STATS: Record<string, LocalStats> = {
  'demo-student-001': {
    total_matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    total_tasks_solved: 0,
    correct_tasks: 0,
  },
  'demo-advanced-001': {
    total_matches: 12,
    wins: 7,
    losses: 4,
    draws: 1,
    total_tasks_solved: 85,
    correct_tasks: 68,
  },
  'demo-master-001': {
    total_matches: 50,
    wins: 35,
    losses: 10,
    draws: 5,
    total_tasks_solved: 200,
    correct_tasks: 180,
  },
};

const STORAGE_KEY = 'olimpium_local_user';
const USERS_KEY = 'olimpium_users';

// Инициализация localStorage с демо-пользователями
export function initLocalStorage() {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

// Получить всех пользователей
export function getAllUsers(): LocalUser[] {
  initLocalStorage();
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : DEMO_USERS;
}

// Добавить пользователя
export function addUser(user: LocalUser) {
  const users = getAllUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Найти пользователя по email
export function findUserByEmail(email: string): LocalUser | null {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Вход (локально)
export function localLogin(email: string, password: string): LocalUser | null {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  if (user.password && user.password !== password) {
    throw new Error('Неверный пароль');
  }
  
  // Сохраняем текущего пользователя
  const userToSave = { ...user };
  delete userToSave.password; // Не сохраняем пароль
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
  
  return userToSave;
}

// Регистрация (локально)
export function localRegister(email: string, password: string, username: string): LocalUser {
  // Проверяем существование
  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  // Создаем нового пользователя
  const newUser: LocalUser = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    username,
    rating: 1200,
    level: 1,
    password,
  };
  
  addUser(newUser);
  
  // Автоматический вход
  const userToSave = { ...newUser };
  delete userToSave.password;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userToSave));
  
  return userToSave;
}

// Выход (локально)
export function localLogout() {
  localStorage.removeItem(STORAGE_KEY);
}

// Получить текущего пользователя
export function getCurrentLocalUser(): LocalUser | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Получить статистику пользователя
export function getLocalStats(userId: string): LocalStats {
  // Сначала проверяем демо-статистику
  if (DEMO_STATS[userId]) {
    return DEMO_STATS[userId];
  }
  
  // Для новых пользователей возвращаем пустую статистику
  return {
    total_matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    total_tasks_solved: 0,
    correct_tasks: 0,
  };
}

// Обновить статистику пользователя
export function updateLocalStats(userId: string, stats: Partial<LocalStats>) {
  const statsKey = `olimpium_stats_${userId}`;
  const current = getLocalStats(userId);
  const updated = { ...current, ...stats };
  localStorage.setItem(statsKey, JSON.stringify(updated));
}

// Обновить профиль пользователя
export function updateLocalProfile(userId: string, updates: Partial<LocalUser>) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Обновляем текущего пользователя если это он
    const current = getCurrentLocalUser();
    if (current && current.id === userId) {
      const updated = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }
}

// Проверка доступности Supabase
export async function checkSupabaseAvailability(): Promise<boolean> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key || url.includes('your-project') || key.includes('your_')) {
      console.warn('⚠️ Supabase не настроен. Используется локальный режим.');
      return false;
    }
    
    // Пытаемся сделать простой запрос
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Не удалось подключиться к Supabase:', error);
    return false;
  }
}
