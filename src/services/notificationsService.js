import { supabase } from '../lib/supabase'

// Получить все уведомления пользователя
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Отметить уведомление как прочитанное
export async function markAsRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}

// Отметить все уведомления пользователя как прочитанные
export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

// Создать новое уведомление
// Пример: createNotification(user.id, 'review', 'Пользователь Иван оставил отзыв', '/profile/123')
export async function createNotification({ userId, type, content, link }) {
  const { error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        type,
        content,
        link,
      },
    ])

  if (error) throw error
  return true
}
