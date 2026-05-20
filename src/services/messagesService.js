import { supabase } from '../lib/supabase'

const conversationSelect = `
  *,
  customer:customer_id (
    id,
    full_name,
    avatar_url
  ),
  specialist:specialist_id (
    id,
    full_name,
    avatar_url
  ),
  service:service_id (
    id,
    title
  ),
  job:job_id (
    id,
    title
  )
`

export async function findOrCreateConversation({
  serviceId = null,
  jobId = null,
  customerId,
  specialistId,
  createdBy,
}) {
  if (!customerId || !specialistId || !createdBy) {
    throw new Error('Не хватает данных для создания чата')
  }

  if (!serviceId && !jobId) {
    throw new Error('Не указан serviceId или jobId')
  }

  let exactQuery = supabase
    .from('conversations')
    .select(conversationSelect)
    .eq('customer_id', customerId)
    .eq('specialist_id', specialistId)

  if (serviceId) {
    exactQuery = exactQuery.eq('service_id', serviceId).is('job_id', null)
  } else {
    exactQuery = exactQuery.eq('job_id', jobId).is('service_id', null)
  }

  const { data: exactMatch, error: exactError } = await exactQuery.limit(1).maybeSingle()

  if (exactError) {
    throw exactError
  }

  if (exactMatch) {
    return exactMatch
  }

  let reverseQuery = supabase
    .from('conversations')
    .select(conversationSelect)
    .eq('customer_id', specialistId)
    .eq('specialist_id', customerId)

  if (serviceId) {
    reverseQuery = reverseQuery.eq('service_id', serviceId).is('job_id', null)
  } else {
    reverseQuery = reverseQuery.eq('job_id', jobId).is('service_id', null)
  }

  const { data: reverseMatch, error: reverseError } = await reverseQuery.limit(1).maybeSingle()

  if (reverseError) {
    throw reverseError
  }

  if (reverseMatch) {
    return reverseMatch
  }

  const payload = {
    service_id: serviceId,
    job_id: jobId,
    customer_id: customerId,
    specialist_id: specialistId,
    created_by: createdBy,
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert([payload])
    .select(conversationSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getMyConversations(userId) {
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(conversationSelect)
    .or(`customer_id.eq.${userId},specialist_id.eq.${userId}`)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function getConversationById(conversationId) {
  if (!conversationId) {
    throw new Error('Не указан conversationId')
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(conversationSelect)
    .eq('id', conversationId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function getMessages(conversationId) {
  if (!conversationId) {
    throw new Error('Не указан conversationId')
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function sendMessage({ conversationId, senderId, body, imageUrls = [], documentUrls = [] }) {
  const cleanBody = body?.trim() || ''

  if (!conversationId) throw new Error('Не указан conversationId')
  if (!senderId) throw new Error('Не указан senderId')
  if (!cleanBody && imageUrls.length === 0 && documentUrls.length === 0) {
    throw new Error('Введите сообщение или прикрепите файл')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: senderId,
      body: cleanBody,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      document_urls: documentUrls.length > 0 ? documentUrls : null,
    }])
    .select(`*, sender:sender_id (id, full_name, avatar_url)`)
    .single()

  if (error) throw error

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

export async function updateMessage(messageId, newBody) {
  const { data, error } = await supabase
    .from('messages')
    .update({ body: newBody.trim(), is_edited: true })
    .eq('id', messageId)
    .select(`*, sender:sender_id (id, full_name, avatar_url)`)
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(messageId) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
}

export async function clearConversation(conversationId) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)

  if (error) throw error
}

export async function deleteConversation(conversationId) {
  // First clear all messages, then delete the conversation itself
  await clearConversation(conversationId)

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) throw error
}

export function subscribeToMessages(conversationId, callback) {
  if (!conversationId) {
    throw new Error('Не указан conversationId для подписки')
  }

  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        const { data, error } = await supabase
          .from('messages')
          .select(`*, sender:sender_id (id, full_name, avatar_url)`)
          .eq('id', payload.new.id)
          .single()

        if (!error && data) callback({ type: 'INSERT', message: data })
      }
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        const { data, error } = await supabase
          .from('messages')
          .select(`*, sender:sender_id (id, full_name, avatar_url)`)
          .eq('id', payload.new.id)
          .single()

        if (!error && data) callback({ type: 'UPDATE', message: data })
      }
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        callback({ type: 'DELETE', message: { id: payload.old.id } })
      }
    )
    .subscribe()

  return channel
}

export async function markMessagesAsRead(conversationId, currentUserId) {
  if (!conversationId || !currentUserId) {
    throw new Error('Не хватает данных для отметки прочитанного')
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', currentUserId)
    .eq('is_read', false)

  if (error) {
    throw error
  }
}

export async function getUnreadMessagesCount(userId) {
  if (!userId) {
    return 0
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('id')
    .or(`customer_id.eq.${userId},specialist_id.eq.${userId}`)

  if (conversationsError) {
    throw conversationsError
  }

  const ids = (conversations || []).map((item) => item.id)

  if (!ids.length) {
    return 0
  }

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', ids)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) {
    throw error
  }

  return count || 0
}