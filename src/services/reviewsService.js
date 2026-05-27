import { supabase } from '../lib/supabase'

export async function createReview({ reviewer_id, reviewee_id, rating, comment }) {
  if (!reviewer_id || !reviewee_id) {
    throw new Error('Недостаточно данных для создания отзыва')
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Рейтинг должен быть от 1 до 5')
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        reviewer_id,
        reviewee_id,
        rating,
        comment,
      },
    ])
    .select(`
      *,
      reviewer:reviewer_id (
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .single()

  if (error) {
    throw error
  }

  // Обновляем статистику профиля, если нужно
  // Но обычно это делает триггер в БД, или мы просто отображаем на клиенте.
  return data
}

export async function checkCanReview(currentUserId, specialistId) {
  if (!currentUserId || !specialistId) return false
  if (currentUserId === specialistId) return false

  // Проверяем, есть ли диалог между этими пользователями
  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(customer_id.eq.${currentUserId},specialist_id.eq.${specialistId}),and(customer_id.eq.${specialistId},specialist_id.eq.${currentUserId})`)
    .limit(1)

  if (error) {
    console.error('Ошибка при проверке права на отзыв:', error)
    return false
  }

  return data && data.length > 0
}

export async function getReviewsByUserId(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id(full_name, avatar_url)
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Ошибка при получении отзывов:', error)
    return []
  }
  return data
}

export async function deleteReview(reviewId) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
}
