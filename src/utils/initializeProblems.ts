import { supabase } from '/utils/supabase/client';
import { PROBLEMS_DATA } from '/src/data/problems';

// Edge Functions удалены - используем прямые запросы к Supabase
export async function initializeProblems() {
  try {
    // Проверяем, есть ли уже задачи в базе
    const { data: existingProblems, error: checkError } = await supabase
      .from('problems')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking problems:', checkError);
      return;
    }

    if (existingProblems && existingProblems.length > 0) {
      // Задачи уже есть
      console.log('Problems already initialized');
      return;
    }

    console.log('Initializing problems...');

    // Загружаем задачи напрямую через Supabase клиент
    // Примечание: Для этого требуются соответствующие RLS политики
    const { data, error: insertError } = await supabase
      .from('problems')
      .insert(PROBLEMS_DATA)
      .select();

    if (insertError) {
      console.error('Error inserting problems:', insertError);
      console.error('Hint: Make sure RLS policies allow INSERT for authenticated users or public');
      return;
    }

    console.log(`Successfully initialized ${data?.length || 0} problems`);
  } catch (error) {
    console.error('Error initializing problems:', error);
  }
}
