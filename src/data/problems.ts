// База из 135 задач: 15 задач на каждый из 9 предметов
// Для каждого предмета: 5 легких, 5 средних, 5 сложных

export const PROBLEMS_DATA = [
  // МАТЕМАТИКА (15 задач)
  {
    id: 'math_001',
    subject_id: 'math',
    topic: 'Алгебра',
    difficulty: 1,
    question: 'Решите уравнение: 2x + 5 = 13',
    correct_answer: '4',
    explanation: 'Вычитаем 5 из обеих частей: 2x = 8, затем делим на 2: x = 4'
  },
  {
    id: 'math_002',
    subject_id: 'math',
    topic: 'Геометрия',
    difficulty: 1,
    question: 'Чему равна сумма углов треугольника в градусах?',
    correct_answer: '180',
    explanation: 'Сумма углов любого треугольника всегда равна 180 градусам'
  },
  {
    id: 'math_003',
    subject_id: 'math',
    topic: 'Арифметика',
    difficulty: 1,
    question: 'Вычислите: 15% от 200',
    correct_answer: '30',
    explanation: '15% от 200 = 0.15 × 200 = 30'
  },
  {
    id: 'math_004',
    subject_id: 'math',
    topic: 'Алгебра',
    difficulty: 1,
    question: 'Найдите x: x² = 16',
    correct_answer: '4',
    explanation: 'Извлекаем квадратный корень: x = √16 = 4 (берем положительное значение)'
  },
  {
    id: 'math_005',
    subject_id: 'math',
    topic: 'Дроби',
    difficulty: 1,
    question: 'Сколько будет 1/2 + 1/4?',
    correct_answer: '3/4',
    explanation: 'Приводим к общему знаменателю: 2/4 + 1/4 = 3/4'
  },
  {
    id: 'math_006',
    subject_id: 'math',
    topic: 'Алгебра',
    difficulty: 2,
    question: 'Решите систему: x + y = 10, x - y = 2. Чему равен x?',
    correct_answer: '6',
    explanation: 'Складываем уравнения: 2x = 12, следовательно x = 6'
  },
  {
    id: 'math_007',
    subject_id: 'math',
    topic: 'Геометрия',
    difficulty: 2,
    question: 'Площадь круга с радиусом 5. Ответ округлите до целого (π ≈ 3.14)',
    correct_answer: '79',
    explanation: 'S = πr² = 3.14 × 25 = 78.5 ≈ 79'
  },
  {
    id: 'math_008',
    subject_id: 'math',
    topic: 'Прогрессии',
    difficulty: 2,
    question: 'Найдите 5-й член арифметической прогрессии: 2, 5, 8, 11...',
    correct_answer: '14',
    explanation: 'Разность d = 3, пятый член: a₅ = a₁ + 4d = 2 + 12 = 14'
  },
  {
    id: 'math_009',
    subject_id: 'math',
    topic: 'Вероятность',
    difficulty: 2,
    question: 'Какова вероятность выпадения четного числа на кубике? (ответ дробью)',
    correct_answer: '1/2',
    explanation: 'Четных чисел 3 (2,4,6) из 6 возможных: 3/6 = 1/2'
  },
  {
    id: 'math_010',
    subject_id: 'math',
    topic: 'Логарифмы',
    difficulty: 2,
    question: 'Вычислите: log₂(8)',
    correct_answer: '3',
    explanation: '2³ = 8, следовательно log₂(8) = 3'
  },
  {
    id: 'math_011',
    subject_id: 'math',
    topic: 'Комбинаторика',
    difficulty: 3,
    question: 'Сколькими способами можно расставить 4 книги на полке?',
    correct_answer: '24',
    explanation: 'Перестановки из 4 элементов: P₄ = 4! = 24'
  },
  {
    id: 'math_012',
    subject_id: 'math',
    topic: 'Тригонометрия',
    difficulty: 3,
    question: 'Чему равен sin(30°)?',
    correct_answer: '1/2',
    explanation: 'Табличное значение: sin(30°) = 1/2'
  },
  {
    id: 'math_013',
    subject_id: 'math',
    topic: 'Производные',
    difficulty: 3,
    question: 'Найдите производную функции f(x) = x³',
    correct_answer: '3x²',
    explanation: 'По правилу степени: (x³)\' = 3x²'
  },
  {
    id: 'math_014',
    subject_id: 'math',
    topic: 'Планиметрия',
    difficulty: 3,
    question: 'Диагональ квадрата равна 10√2. Чему равна сторона?',
    correct_answer: '10',
    explanation: 'Диагональ квадрата d = a√2, следовательно a = d/√2 = 10'
  },
  {
    id: 'math_015',
    subject_id: 'math',
    topic: 'Неравенства',
    difficulty: 3,
    question: 'При каких x выполняется x² - 5x + 6 < 0? (интервал)',
    correct_answer: '(2; 3)',
    explanation: 'Корни уравнения x² - 5x + 6 = 0: x = 2 и x = 3. Парабола ниже нуля между корнями'
  },

  // ФИЗИКА (15 задач)
  {
    id: 'physics_001',
    subject_id: 'physics',
    topic: 'Механика',
    difficulty: 1,
    question: 'С каким ускорением падают тела в вакууме? (м/с²)',
    correct_answer: '10',
    explanation: 'Ускорение свободного падения g ≈ 10 м/с² (точнее 9.8)'
  },
  {
    id: 'physics_002',
    subject_id: 'physics',
    topic: 'Кинематика',
    difficulty: 1,
    question: 'Какой путь пройдет тело за 5с при скорости 20 м/с?',
    correct_answer: '100',
    explanation: 'S = vt = 20 × 5 = 100 метров'
  },
  {
    id: 'physics_003',
    subject_id: 'physics',
    topic: 'Электричество',
    difficulty: 1,
    question: 'Единица измерения силы тока?',
    correct_answer: 'Ампер',
    explanation: 'Сила тока измеряется в Амперах (А)'
  },
  {
    id: 'physics_004',
    subject_id: 'physics',
    topic: 'Оптика',
    difficulty: 1,
    question: 'Скорость света в вакууме (км/с, округленно)?',
    correct_answer: '300000',
    explanation: 'c = 300 000 км/с или 3×10⁸ м/с'
  },
  {
    id: 'physics_005',
    subject_id: 'physics',
    topic: 'Термодинамика',
    difficulty: 1,
    question: 'При какой температуре замерзает вода? (°C)',
    correct_answer: '0',
    explanation: 'Вода замерзает при 0°C при нормальном давлении'
  },
  {
    id: 'physics_006',
    subject_id: 'physics',
    topic: 'Динамика',
    difficulty: 2,
    question: 'Какая сила нужна для ускорения тела массой 10 кг с a=2 м/с²? (Н)',
    correct_answer: '20',
    explanation: 'F = ma = 10 × 2 = 20 Ньютонов'
  },
  {
    id: 'physics_007',
    subject_id: 'physics',
    topic: 'Работа и энергия',
    difficulty: 2,
    question: 'Какую работу совершает сила 50Н на пути 4м? (Дж)',
    correct_answer: '200',
    explanation: 'A = Fs = 50 × 4 = 200 Джоулей'
  },
  {
    id: 'physics_008',
    subject_id: 'physics',
    topic: 'Закон Ома',
    difficulty: 2,
    question: 'Напряжение 12В, сопротивление 4 Ом. Найдите силу тока (А)',
    correct_answer: '3',
    explanation: 'I = U/R = 12/4 = 3 Ампера'
  },
  {
    id: 'physics_009',
    subject_id: 'physics',
    topic: 'Колебания',
    difficulty: 2,
    question: 'Период колебаний 0.5с. Чему равна частота? (Гц)',
    correct_answer: '2',
    explanation: 'f = 1/T = 1/0.5 = 2 Герца'
  },
  {
    id: 'physics_010',
    subject_id: 'physics',
    topic: 'Мощность',
    difficulty: 2,
    question: 'Работа 1000Дж за 10с. Найдите мощность (Вт)',
    correct_answer: '100',
    explanation: 'P = A/t = 1000/10 = 100 Ватт'
  },
  {
    id: 'physics_011',
    subject_id: 'physics',
    topic: 'Импульс',
    difficulty: 3,
    question: 'Импульс тела массой 5кг при скорости 4 м/с? (кг·м/с)',
    correct_answer: '20',
    explanation: 'p = mv = 5 × 4 = 20 кг·м/с'
  },
  {
    id: 'physics_012',
    subject_id: 'physics',
    topic: 'Магнетизм',
    difficulty: 3,
    question: 'Сила Лоренца перпендикулярна скорости и чему еще?',
    correct_answer: 'магнитному полю',
    explanation: 'F = qvBsinα направлена перпендикулярно v и B'
  },
  {
    id: 'physics_013',
    subject_id: 'physics',
    topic: 'Ядерная физика',
    difficulty: 3,
    question: 'Сколько протонов в ядре атома углерода-12?',
    correct_answer: '6',
    explanation: 'Заряд ядра углерода Z = 6 (это атомный номер)'
  },
  {
    id: 'physics_014',
    subject_id: 'physics',
    topic: 'Фотоэффект',
    difficulty: 3,
    question: 'Кто объяснил фотоэффект? (Фамилия)',
    correct_answer: 'Эйнштейн',
    explanation: 'Альберт Эйнштейн объяснил фотоэффект в 1905 году'
  },
  {
    id: 'physics_015',
    subject_id: 'physics',
    topic: 'Относительность',
    difficulty: 3,
    question: 'Формула E=mc². Что означает c?',
    correct_answer: 'скорость света',
    explanation: 'c - скорость света в вакууме'
  },

  // ИНФОРМАТИКА (15 задач)
  {
    id: 'cs_001',
    subject_id: 'informatics',
    topic: 'Системы счисления',
    difficulty: 1,
    question: 'Переведите число 10 из десятичной в двоичную систему',
    correct_answer: '1010',
    explanation: '10₁₀ = 8 + 2 = 2³ + 2¹ = 1010₂'
  },
  {
    id: 'cs_002',
    subject_id: 'informatics',
    topic: 'Логика',
    difficulty: 1,
    question: 'Результат логического И: 1 AND 0',
    correct_answer: '0',
    explanation: 'Логическое И возвращает 1 только если оба операнда 1'
  },
  {
    id: 'cs_003',
    subject_id: 'informatics',
    topic: 'Базы данных',
    difficulty: 1,
    question: 'Язык запросов к реляционным БД?',
    correct_answer: 'SQL',
    explanation: 'SQL (Structured Query Language) - язык структурированных запросов'
  },
  {
    id: 'cs_004',
    subject_id: 'informatics',
    topic: 'Алгоритмы',
    difficulty: 1,
    question: 'Сколько байт в одном килобайте?',
    correct_answer: '1024',
    explanation: '1 КБ = 2¹⁰ байт = 1024 байт'
  },
  {
    id: 'cs_005',
    subject_id: 'informatics',
    topic: 'Программирование',
    difficulty: 1,
    question: 'Что выведет: print(5 + 3)?',
    correct_answer: '8',
    explanation: 'Сложение чисел 5 и 3 равно 8'
  },
  {
    id: 'cs_006',
    subject_id: 'informatics',
    topic: 'Сортировка',
    difficulty: 2,
    question: 'Сложность пузырьковой сортировки в худшем случае (O-нотация)',
    correct_answer: 'O(n²)',
    explanation: 'Bubble sort имеет квадратичную сложность O(n²)'
  },
  {
    id: 'cs_007',
    subject_id: 'informatics',
    topic: 'Структуры данных',
    difficulty: 2,
    question: 'Структура данных LIFO (последний вошел - первый вышел)?',
    correct_answer: 'стек',
    explanation: 'Stack (стек) работает по принципу LIFO'
  },
  {
    id: 'cs_008',
    subject_id: 'informatics',
    topic: 'Рекурсия',
    difficulty: 2,
    question: 'Факториал 5 (5!)',
    correct_answer: '120',
    explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120'
  },
  {
    id: 'cs_009',
    subject_id: 'informatics',
    topic: 'Графы',
    difficulty: 2,
    question: 'Минимальное число ребер в связном графе из 10 вершин?',
    correct_answer: '9',
    explanation: 'Минимально связный граф - дерево, у дерева n-1 ребро'
  },
  {
    id: 'cs_010',
    subject_id: 'informatics',
    topic: 'ООП',
    difficulty: 2,
    question: 'Принцип ООП: сокрытие данных?',
    correct_answer: 'инкапсуляция',
    explanation: 'Encapsulation (инкапсуляция) - сокрытие внутренних данных'
  },
  {
    id: 'cs_011',
    subject_id: 'informatics',
    topic: 'Алгоритмы',
    difficulty: 3,
    question: 'Алгоритм поиска кратчайшего пути в графе (фамилия автора)',
    correct_answer: 'Дейкстра',
    explanation: 'Алгоритм Дейкстры находит кратчайшие пути от вершины'
  },
  {
    id: 'cs_012',
    subject_id: 'informatics',
    topic: 'Деревья',
    difficulty: 3,
    question: 'Максимальная высота AVL-дерева из 7 узлов?',
    correct_answer: '3',
    explanation: 'AVL-дерево сбалансировано, высота ≈ log₂(n) ≈ 2.8 ≈ 3'
  },
  {
    id: 'cs_013',
    subject_id: 'informatics',
    topic: 'Динамическое программирование',
    difficulty: 3,
    question: '8-е число Фибоначчи (1,1,2,3,5,8...)',
    correct_answer: '21',
    explanation: 'F(8) = F(7) + F(6) = 13 + 8 = 21'
  },
  {
    id: 'cs_014',
    subject_id: 'informatics',
    topic: 'NP-полнота',
    difficulty: 3,
    question: 'Задача коммивояжера относится к классу?',
    correct_answer: 'NP-полные',
    explanation: 'TSP - классическая NP-полная задача'
  },
  {
    id: 'cs_015',
    subject_id: 'informatics',
    topic: 'Криптография',
    difficulty: 3,
    question: 'Алгоритм шифрования: симметричный или асимметричный - RSA?',
    correct_answer: 'асимметричный',
    explanation: 'RSA использует пару ключей (публичный/приватный)'
  },

  // ХИМИЯ (15 задач)
  {
    id: 'chem_001',
    subject_id: 'chemistry',
    topic: 'Основы',
    difficulty: 1,
    question: 'Символ химического элемента кислород?',
    correct_answer: 'O',
    explanation: 'Oxygen обозначается буквой O'
  },
  {
    id: 'chem_002',
    subject_id: 'chemistry',
    topic: 'Валентность',
    difficulty: 1,
    question: 'Валентность водорода?',
    correct_answer: '1',
    explanation: 'Водород всегда имеет валентность I (1)'
  },
  {
    id: 'chem_003',
    subject_id: 'chemistry',
    topic: 'Растворы',
    difficulty: 1,
    question: 'pH нейтрального раствора?',
    correct_answer: '7',
    explanation: 'Нейтральная среда имеет pH = 7'
  },
  {
    id: 'chem_004',
    subject_id: 'chemistry',
    topic: 'Периодическая система',
    difficulty: 1,
    question: 'Сколько элементов в периодической таблице Менделеева? (округленно до 120)',
    correct_answer: '118',
    explanation: 'На 2026 год известно 118 химических элементов'
  },
  {
    id: 'chem_005',
    subject_id: 'chemistry',
    topic: 'Агрегатные состояния',
    difficulty: 1,
    question: 'Формула воды?',
    correct_answer: 'H2O',
    explanation: 'Вода состоит из двух атомов водорода и одного кислорода'
  },
  {
    id: 'chem_006',
    subject_id: 'chemistry',
    topic: 'Реакции',
    difficulty: 2,
    question: 'Продукт горения метана CH₄ в кислороде (кроме воды)?',
    correct_answer: 'CO2',
    explanation: 'CH₄ + 2O₂ → CO₂ + 2H₂O (углекислый газ и вода)'
  },
  {
    id: 'chem_007',
    subject_id: 'chemistry',
    topic: 'Моль',
    difficulty: 2,
    question: 'Сколько граммов весит 1 моль углерода-12? (г/моль)',
    correct_answer: '12',
    explanation: 'Молярная масса углерода-12 равна 12 г/моль'
  },
  {
    id: 'chem_008',
    subject_id: 'chemistry',
    topic: 'Электрохимия',
    difficulty: 2,
    question: 'Процесс потери электронов называется?',
    correct_answer: 'окисление',
    explanation: 'Окисление - отдача электронов, восстановление - принятие'
  },
  {
    id: 'chem_009',
    subject_id: 'chemistry',
    topic: 'Органическая химия',
    difficulty: 2,
    question: 'Общая формула алканов?',
    correct_answer: 'CnH2n+2',
    explanation: 'Алканы (насыщенные углеводороды) имеют формулу CₙH₂ₙ₊₂'
  },
  {
    id: 'chem_010',
    subject_id: 'chemistry',
    topic: 'Кислоты',
    difficulty: 2,
    question: 'Формула серной кислоты?',
    correct_answer: 'H2SO4',
    explanation: 'Серная кислота - H₂SO₄'
  },
  {
    id: 'chem_011',
    subject_id: 'chemistry',
    topic: 'Термохимия',
    difficulty: 3,
    question: 'Реакция с выделением тепла называется?',
    correct_answer: 'экзотермическая',
    explanation: 'Экзотермические реакции выделяют энергию (ΔH < 0)'
  },
  {
    id: 'chem_012',
    subject_id: 'chemistry',
    topic: 'Катализ',
    difficulty: 3,
    question: 'Вещество, ускоряющее реакцию, но не расходующееся?',
    correct_answer: 'катализатор',
    explanation: 'Катализатор изменяет скорость, но не входит в продукты'
  },
  {
    id: 'chem_013',
    subject_id: 'chemistry',
    topic: 'Изомерия',
    difficulty: 3,
    question: 'Сколько изомеров у бутана C₄H₁₀?',
    correct_answer: '2',
    explanation: 'н-бутан и изобутан (2-метилпропан)'
  },
  {
    id: 'chem_014',
    subject_id: 'chemistry',
    topic: 'Электролиз',
    difficulty: 3,
    question: 'На каком электроде выделяется металл при электролизе?',
    correct_answer: 'катод',
    explanation: 'Металлы восстанавливаются на катоде (отрицательный электрод)'
  },
  {
    id: 'chem_015',
    subject_id: 'chemistry',
    topic: 'Комплексные соединения',
    difficulty: 3,
    question: 'Число лигандов вокруг центрального иона называется?',
    correct_answer: 'координационное число',
    explanation: 'КЧ показывает число связанных лигандов'
  },

  // БИОЛОГИЯ (15 задач)
  {
    id: 'bio_001',
    subject_id: 'biology',
    topic: 'Клетка',
    difficulty: 1,
    question: 'Органоид, производящий энергию в клетке?',
    correct_answer: 'митохондрия',
    explanation: 'Митохондрии - "энергетические станции" клетки'
  },
  {
    id: 'bio_002',
    subject_id: 'biology',
    topic: 'Генетика',
    difficulty: 1,
    question: 'Молекула-носитель генетической информации?',
    correct_answer: 'ДНК',
    explanation: 'ДНК (дезоксирибонуклеиновая кислота) хранит гены'
  },
  {
    id: 'bio_003',
    subject_id: 'biology',
    topic: 'Ботаника',
    difficulty: 1,
    question: 'Процесс образования кислорода растениями?',
    correct_answer: 'фотосинтез',
    explanation: 'Фотосинтез: CO₂ + H₂O + свет → глюкоза + O₂'
  },
  {
    id: 'bio_004',
    subject_id: 'biology',
    topic: 'Анатомия',
    difficulty: 1,
    question: 'Сколько камер в сердце человека?',
    correct_answer: '4',
    explanation: 'Сердце состоит из двух предсердий и двух желудочков'
  },
  {
    id: 'bio_005',
    subject_id: 'biology',
    topic: 'Эволюция',
    difficulty: 1,
    question: 'Автор теории естественного отбора? (Фамилия)',
    correct_answer: 'Дарвин',
    explanation: 'Чарльз Дарвин создал теорию эволюции путем естественного отбора'
  },
  {
    id: 'bio_006',
    subject_id: 'biology',
    topic: 'Генетика',
    difficulty: 2,
    question: 'Сколько хромосом у человека?',
    correct_answer: '46',
    explanation: '23 пары = 46 хромосом (диплоидный набор 2n)'
  },
  {
    id: 'bio_007',
    subject_id: 'biology',
    topic: 'Физиология',
    difficulty: 2,
    question: 'Гормон поджелудочной железы, регулирующий глюкозу?',
    correct_answer: 'инсулин',
    explanation: 'Инсулин снижает уровень глюкозы в крови'
  },
  {
    id: 'bio_008',
    subject_id: 'biology',
    topic: 'Экология',
    difficulty: 2,
    question: 'Организмы, создающие органику из неорганики?',
    correct_answer: 'продуценты',
    explanation: 'Продуценты (растения) - автотрофы, создают органику'
  },
  {
    id: 'bio_009',
    subject_id: 'biology',
    topic: 'Молекулярная биология',
    difficulty: 2,
    question: 'Процесс синтеза РНК на матрице ДНК?',
    correct_answer: 'транскрипция',
    explanation: 'Транскрипция - переписывание информации ДНК на РНК'
  },
  {
    id: 'bio_010',
    subject_id: 'biology',
    topic: 'Систематика',
    difficulty: 2,
    question: 'К какому царству относятся грибы?',
    correct_answer: 'грибы',
    explanation: 'Грибы - отдельное царство, не растения и не животные'
  },
  {
    id: 'bio_011',
    subject_id: 'biology',
    topic: 'Цитология',
    difficulty: 3,
    question: 'Фаза митоза с выстраиванием хромосом по экватору?',
    correct_answer: 'метафаза',
    explanation: 'В метафазе хромосомы выстраиваются на экваторе клетки'
  },
  {
    id: 'bio_012',
    subject_id: 'biology',
    topic: 'Иммунология',
    difficulty: 3,
    question: 'Клетки иммунной системы, вырабатывающие антитела?',
    correct_answer: 'лимфоциты',
    explanation: 'B-лимфоциты продуцируют антитела'
  },
  {
    id: 'bio_013',
    subject_id: 'biology',
    topic: 'Менделизм',
    difficulty: 3,
    question: 'Соотношение по фенотипу при моногибридном скрещивании F₂?',
    correct_answer: '3:1',
    explanation: 'Второй закон Менделя: расщепление 3:1 по доминантному признаку'
  },
  {
    id: 'bio_014',
    subject_id: 'biology',
    topic: 'Нейрофизиология',
    difficulty: 3,
    question: 'Медиатор в нервно-мышечных синапсах?',
    correct_answer: 'ацетилхолин',
    explanation: 'Ацетилхолин передает сигнал в нервно-мышечном соединении'
  },
  {
    id: 'bio_015',
    subject_id: 'biology',
    topic: 'Биотехнология',
    difficulty: 3,
    question: 'Метод амплификации ДНК (аббревиатура)?',
    correct_answer: 'ПЦР',
    explanation: 'ПЦР (PCR) - полимеразная цепная реакция'
  },

  // ГЕОГРАФИЯ (15 задач)
  {
    id: 'geo_001',
    subject_id: 'geography',
    topic: 'Столицы',
    difficulty: 1,
    question: 'Столица России?',
    correct_answer: 'Москва',
    explanation: 'Москва - столица и крупнейший город России'
  },
  {
    id: 'geo_002',
    subject_id: 'geography',
    topic: 'Океаны',
    difficulty: 1,
    question: 'Самый большой океан на Земле?',
    correct_answer: 'Тихий',
    explanation: 'Тихий океан занимает почти половину Мирового океана'
  },
  {
    id: 'geo_003',
    subject_id: 'geography',
    topic: 'Горы',
    difficulty: 1,
    question: 'Самая высокая гора в мире?',
    correct_answer: 'Эверест',
    explanation: 'Эверест (Джомолунгма) - 8848 метров'
  },
  {
    id: 'geo_004',
    subject_id: 'geography',
    topic: 'Реки',
    difficulty: 1,
    question: 'Самая длинная река в мире?',
    correct_answer: 'Нил',
    explanation: 'Нил (6650 км) считается длиннейшей рекой'
  },
  {
    id: 'geo_005',
    subject_id: 'geography',
    topic: 'Континенты',
    difficulty: 1,
    question: 'Сколько материков на Земле?',
    correct_answer: '6',
    explanation: 'Евразия, Африка, Северная Америка, Южная Америка, Антарктида, Австралия'
  },
  {
    id: 'geo_006',
    subject_id: 'geography',
    topic: 'Климат',
    difficulty: 2,
    question: 'Самый холодный материк?',
    correct_answer: 'Антарктида',
    explanation: 'Антарктида - самый холодный континент (до -89°C)'
  },
  {
    id: 'geo_007',
    subject_id: 'geography',
    topic: 'Страны',
    difficulty: 2,
    question: 'Самая большая страна по площади?',
    correct_answer: 'Россия',
    explanation: 'Россия - 17,1 млн км²'
  },
  {
    id: 'geo_008',
    subject_id: 'geography',
    topic: 'Пустыни',
    difficulty: 2,
    question: 'Крупнейшая песчаная пустыня?',
    correct_answer: 'Сахара',
    explanation: 'Сахара - около 9 млн км² в Африке'
  },
  {
    id: 'geo_009',
    subject_id: 'geography',
    topic: 'Население',
    difficulty: 2,
    question: 'Самая населенная страна мира?',
    correct_answer: 'Индия',
    explanation: 'Индия обогнала Китай по населению в 2023 году'
  },
  {
    id: 'geo_010',
    subject_id: 'geography',
    topic: 'Озера',
    difficulty: 2,
    question: 'Самое глубокое озеро в мире?',
    correct_answer: 'Байкал',
    explanation: 'Озеро Байкал - глубина 1642 метра'
  },
  {
    id: 'geo_011',
    subject_id: 'geography',
    topic: 'Геология',
    difficulty: 3,
    question: 'Граница между мантией и ядром Земли называется?',
    correct_answer: 'Гутенберга',
    explanation: 'Граница Гутенберга на глубине ~2900 км'
  },
  {
    id: 'geo_012',
    subject_id: 'geography',
    topic: 'Часовые пояса',
    difficulty: 3,
    question: 'Сколько часовых поясов в России?',
    correct_answer: '11',
    explanation: 'Россия охватывает 11 часовых зон'
  },
  {
    id: 'geo_013',
    subject_id: 'geography',
    topic: 'Вулканы',
    difficulty: 3,
    question: 'Самый активный вулкан Европы?',
    correct_answer: 'Этна',
    explanation: 'Вулкан Этна на Сицилии извергается регулярно'
  },
  {
    id: 'geo_014',
    subject_id: 'geography',
    topic: 'Экономическая география',
    difficulty: 3,
    question: 'Страна - крупнейший производитель нефти (на 2024)?',
    correct_answer: 'США',
    explanation: 'США лидируют в добыче нефти благодаря сланцевым месторождениям'
  },
  {
    id: 'geo_015',
    subject_id: 'geography',
    topic: 'Картография',
    difficulty: 3,
    question: 'Проекция карты, сохраняющая площади?',
    correct_answer: 'равновеликая',
    explanation: 'Равновеликие проекции сохраняют соотношение площадей'
  },

  // ИСТОРИЯ (15 задач)
  {
    id: 'hist_001',
    subject_id: 'history',
    topic: 'Древний мир',
    difficulty: 1,
    question: 'В каком году крестили Русь?',
    correct_answer: '988',
    explanation: 'Крещение Руси князем Владимиром в 988 году'
  },
  {
    id: 'hist_002',
    subject_id: 'history',
    topic: 'Средневековье',
    difficulty: 1,
    question: 'Первый русский царь? (Имя)',
    correct_answer: 'Иван',
    explanation: 'Иван IV Грозный - первый царь всея Руси (1547)'
  },
  {
    id: 'hist_003',
    subject_id: 'history',
    topic: 'Новое время',
    difficulty: 1,
    question: 'Год основания Санкт-Петербурга?',
    correct_answer: '1703',
    explanation: 'Петр I основал Санкт-Петербург в 1703 году'
  },
  {
    id: 'hist_004',
    subject_id: 'history',
    topic: 'XX век',
    difficulty: 1,
    question: 'В каком году началась Первая мировая война?',
    correct_answer: '1914',
    explanation: 'Первая мировая война: 1914-1918'
  },
  {
    id: 'hist_005',
    subject_id: 'history',
    topic: 'СССР',
    difficulty: 1,
    question: 'Год образования СССР?',
    correct_answer: '1922',
    explanation: 'СССР образован 30 декабря 1922 года'
  },
  {
    id: 'hist_006',
    subject_id: 'history',
    topic: 'Великая Отечественная',
    difficulty: 2,
    question: 'День начала ВОВ (число.месяц)?',
    correct_answer: '22 июня',
    explanation: '22 июня 1941 года - нападение Германии на СССР'
  },
  {
    id: 'hist_007',
    subject_id: 'history',
    topic: 'Древняя Русь',
    difficulty: 2,
    question: 'Первая русская летопись?',
    correct_answer: 'Повесть временных лет',
    explanation: 'ПВЛ составлена монахом Нестором в начале XII века'
  },
  {
    id: 'hist_008',
    subject_id: 'history',
    topic: 'Петровские реформы',
    difficulty: 2,
    question: 'Какое звание ввел Петр I вместо боярина?',
    correct_answer: 'граф',
    explanation: 'Петр I ввел европейские титулы: граф, барон'
  },
  {
    id: 'hist_009',
    subject_id: 'history',
    topic: 'Революция',
    difficulty: 2,
    question: 'В каком месяце произошла Октябрьская революция 1917?',
    correct_answer: 'ноябрь',
    explanation: 'По новому стилю - 7 ноября, по старому - 25 октября'
  },
  {
    id: 'hist_010',
    subject_id: 'history',
    topic: 'Холодная война',
    difficulty: 2,
    question: 'Год распада СССР?',
    correct_answer: '1991',
    explanation: 'СССР прекратил существование 26 декабря 1991 года'
  },
  {
    id: 'hist_011',
    subject_id: 'history',
    topic: 'Монгольское иго',
    difficulty: 3,
    question: 'Сколько лет длилось монголо-татарское иго? (округленно)',
    correct_answer: '240',
    explanation: '1240-1480 гг - около 240 лет'
  },
  {
    id: 'hist_012',
    subject_id: 'history',
    topic: 'Смутное время',
    difficulty: 3,
    question: 'Фамилия основателя династии Романовых?',
    correct_answer: 'Романов',
    explanation: 'Михаил Романов избран царем в 1613 году'
  },
  {
    id: 'hist_013',
    subject_id: 'history',
    topic: 'Отечественная война 1812',
    difficulty: 3,
    question: 'Главнокомандующий русской армией в 1812? (Фамилия)',
    correct_answer: 'Кутузов',
    explanation: 'Михаил Илларионович Кутузов - главнокомандующий'
  },
  {
    id: 'hist_014',
    subject_id: 'history',
    topic: 'Реформы XIX века',
    difficulty: 3,
    question: 'Год отмены крепостного права?',
    correct_answer: '1861',
    explanation: 'Александр II отменил крепостное право в 1861 году'
  },
  {
    id: 'hist_015',
    subject_id: 'history',
    topic: 'Индустриализация',
    difficulty: 3,
    question: 'Первая пятилетка в СССР началась в каком году?',
    correct_answer: '1928',
    explanation: 'Первый пятилетний план: 1928-1932'
  },

  // ЛИТЕРАТУРА (15 задач)
  {
    id: 'lit_001',
    subject_id: 'literature',
    topic: 'Пушкин',
    difficulty: 1,
    question: 'Автор "Евгения Онегина"? (Фамилия)',
    correct_answer: 'Пушкин',
    explanation: 'Александр Сергеевич Пушкин написал роман в стихах'
  },
  {
    id: 'lit_002',
    subject_id: 'literature',
    topic: 'Лермонтов',
    difficulty: 1,
    question: 'Произведение Лермонтова о печальном герое нашего времени?',
    correct_answer: 'Герой нашего времени',
    explanation: 'Роман М.Ю. Лермонтова "Герой нашего времени"'
  },
  {
    id: 'lit_003',
    subject_id: 'literature',
    topic: 'Гоголь',
    difficulty: 1,
    question: 'Автор "Ревизора"? (Фамилия)',
    correct_answer: 'Гоголь',
    explanation: 'Николай Васильевич Гоголь - автор комедии "Ревизор"'
  },
  {
    id: 'lit_004',
    subject_id: 'literature',
    topic: 'Толстой',
    difficulty: 1,
    question: 'Эпопея Толстого о войне 1812 года?',
    correct_answer: 'Война и мир',
    explanation: 'Л.Н. Толстой "Война и мир" - эпопея о войне 1812 года'
  },
  {
    id: 'lit_005',
    subject_id: 'literature',
    topic: 'Достоевский',
    difficulty: 1,
    question: 'Главный герой "Преступления и наказания"? (Фамилия)',
    correct_answer: 'Раскольников',
    explanation: 'Родион Романович Раскольников - главный герой романа'
  },
  {
    id: 'lit_006',
    subject_id: 'literature',
    topic: 'Жанры',
    difficulty: 2,
    question: 'Жанр "Мертвых душ" по определению Гоголя?',
    correct_answer: 'поэма',
    explanation: 'Гоголь назвал "Мертвые души" поэмой'
  },
  {
    id: 'lit_007',
    subject_id: 'literature',
    topic: 'Чехов',
    difficulty: 2,
    question: 'Какой сад вырубают в пьесе Чехова?',
    correct_answer: 'вишневый',
    explanation: 'А.П. Чехов "Вишнёвый сад"'
  },
  {
    id: 'lit_008',
    subject_id: 'literature',
    topic: 'Грибоедов',
    difficulty: 2,
    question: 'Фамилия главного героя комедии "Горе от ума"?',
    correct_answer: 'Чацкий',
    explanation: 'Александр Андреевич Чацкий - главный герой'
  },
  {
    id: 'lit_009',
    subject_id: 'literature',
    topic: 'Блок',
    difficulty: 2,
    question: 'Поэт Серебряного века, автор "Двенадцати"? (Фамилия)',
    correct_answer: 'Блок',
    explanation: 'Александр Блок написал поэму "Двенадцать"'
  },
  {
    id: 'lit_010',
    subject_id: 'literature',
    topic: 'Булгаков',
    difficulty: 2,
    question: 'Кот из романа "Мастер и Маргарита"?',
    correct_answer: 'Бегемот',
    explanation: 'Кот Бегемот - персонаж свиты Воланда'
  },
  {
    id: 'lit_011',
    subject_id: 'literature',
    topic: 'Стихосложение',
    difficulty: 3,
    question: 'Размер стиха "Мороз и солнце, день чудесный"?',
    correct_answer: 'ямб',
    explanation: 'Четырехстопный ямб - классический размер Пушкина'
  },
  {
    id: 'lit_012',
    subject_id: 'literature',
    topic: 'Тургенев',
    difficulty: 3,
    question: 'Фамилия нигилиста из романа "Отцы и дети"?',
    correct_answer: 'Базаров',
    explanation: 'Евгений Базаров - главный герой-нигилист'
  },
  {
    id: 'lit_013',
    subject_id: 'literature',
    topic: 'Островский',
    difficulty: 3,
    question: 'Название города в пьесах Островского?',
    correct_answer: 'Калинов',
    explanation: 'Калинов - вымышленный город в "Грозе" и других пьесах'
  },
  {
    id: 'lit_014',
    subject_id: 'literature',
    topic: 'Маяковский',
    difficulty: 3,
    question: 'Как Маяковский называл себя и свою поэзию?',
    correct_answer: 'футуризм',
    explanation: 'Владимир Маяковский - представитель футуризма'
  },
  {
    id: 'lit_015',
    subject_id: 'literature',
    topic: 'Ахматова',
    difficulty: 3,
    question: 'Поэма Ахматовой о репрессиях?',
    correct_answer: 'Реквием',
    explanation: 'Анна Ахматова "Реквием" - о жертвах сталинских репрессий'
  },

  // РУССКИЙ ЯЗЫК (15 задач)
  {
    id: 'rus_001',
    subject_id: 'russian',
    topic: 'Орфография',
    difficulty: 1,
    question: 'Сколько букв в русском алфавите?',
    correct_answer: '33',
    explanation: '33 буквы в русском алфавите'
  },
  {
    id: 'rus_002',
    subject_id: 'russian',
    topic: 'Части речи',
    difficulty: 1,
    question: 'Часть речи слова "бежать"?',
    correct_answer: 'глагол',
    explanation: 'Бежать - глагол (что делать?)'
  },
  {
    id: 'rus_003',
    subject_id: 'russian',
    topic: 'Фонетика',
    difficulty: 1,
    question: 'Сколько гласных звуков в русском языке?',
    correct_answer: '6',
    explanation: '6 гласных звуков: [а], [о], [у], [и], [ы], [э]'
  },
  {
    id: 'rus_004',
    subject_id: 'russian',
    topic: 'Пунктуация',
    difficulty: 1,
    question: 'Знак в конце вопросительного предложения?',
    correct_answer: 'вопросительный знак',
    explanation: 'Вопросительный знак (?) ставится в конце вопроса'
  },
  {
    id: 'rus_005',
    subject_id: 'russian',
    topic: 'Морфология',
    difficulty: 1,
    question: 'Сколько падежей в русском языке?',
    correct_answer: '6',
    explanation: 'И., Р., Д., В., Т., П. - 6 падежей'
  },
  {
    id: 'rus_006',
    subject_id: 'russian',
    topic: 'Синтаксис',
    difficulty: 2,
    question: 'Главный член предложения, отвечающий на вопрос "кто? что?"?',
    correct_answer: 'подлежащее',
    explanation: 'Подлежащее - главный член, обозначающий предмет речи'
  },
  {
    id: 'rus_007',
    subject_id: 'russian',
    topic: 'Орфография',
    difficulty: 2,
    question: 'Правильное написание: "прийти" или "придти"?',
    correct_answer: 'прийти',
    explanation: 'Правильно: прийти (современная норма)'
  },
  {
    id: 'rus_008',
    subject_id: 'russian',
    topic: 'Морфемика',
    difficulty: 2,
    question: 'Часть слова без окончания?',
    correct_answer: 'основа',
    explanation: 'Основа слова - часть без окончания'
  },
  {
    id: 'rus_009',
    subject_id: 'russian',
    topic: 'Лексика',
    difficulty: 2,
    question: 'Слова с противоположным значением?',
    correct_answer: 'антонимы',
    explanation: 'Антонимы - слова с противоположным значением (белый-черный)'
  },
  {
    id: 'rus_010',
    subject_id: 'russian',
    topic: 'Причастие',
    difficulty: 2,
    question: 'Суффикс действительного причастия настоящего времени?',
    correct_answer: '-ущ-',
    explanation: 'Суффиксы -ущ-/-ющ- или -ащ-/-ящ- для действительных причастий'
  },
  {
    id: 'rus_011',
    subject_id: 'russian',
    topic: 'Сложные предложения',
    difficulty: 3,
    question: 'Тип связи в предложении с союзом "что"?',
    correct_answer: 'подчинительная',
    explanation: 'Подчинительная связь в сложноподчиненном предложении'
  },
  {
    id: 'rus_012',
    subject_id: 'russian',
    topic: 'Стилистика',
    difficulty: 3,
    question: 'Стиль научных статей и диссертаций?',
    correct_answer: 'научный',
    explanation: 'Научный стиль - для научных текстов'
  },
  {
    id: 'rus_013',
    subject_id: 'russian',
    topic: 'Деепричастие',
    difficulty: 3,
    question: 'От какой части речи образуется деепричастие?',
    correct_answer: 'глагол',
    explanation: 'Деепричастие - особая форма глагола'
  },
  {
    id: 'rus_014',
    subject_id: 'russian',
    topic: 'Орфоэпия',
    difficulty: 3,
    question: 'Правильное ударение в слове "звонит" (слог)?',
    correct_answer: '2',
    explanation: 'ЗвонИт - ударение на второй слог (И)'
  },
  {
    id: 'rus_015',
    subject_id: 'russian',
    topic: 'Паронимы',
    difficulty: 3,
    question: 'Слова сходного звучания, но разного значения?',
    correct_answer: 'паронимы',
    explanation: 'Паронимы - однокоренные слова разного значения (одеть-надеть)'
  }
];
