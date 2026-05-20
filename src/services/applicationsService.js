import { supabase } from '../lib/supabase'

export async function createApplication(payload) {
  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .insert([payload])
    .select(`
      *,
      jobs:job_id (
        id,
        user_id,
        title
      ),
      profiles:contractor_id (
        id,
        full_name
      )
    `)
    .single()

  if (applicationError) throw applicationError

  const jobOwnerId = application?.jobs?.user_id
  const contractorName = application?.profiles?.full_name || 'Исполнитель'
  const jobTitle = application?.jobs?.title || 'объявление'

  if (jobOwnerId && jobOwnerId !== payload.contractor_id) {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: jobOwnerId,
          type: 'application',
          title: 'Новый отклик',
          message: `${contractorName} откликнулся(ась) на ваш заказ "${jobTitle}"`,
          link: `/jobs/${payload.job_id}`,
          related_job_id: payload.job_id,
          related_user_id: payload.contractor_id,
          is_read: false,
        },
      ])

    if (notificationError) throw notificationError
  }

  return application
}

export async function getApplicationsForJob(jobId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:contractor_id (
        id,
        full_name,
        avatar_url,
        rating,
        role,
        phone
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMyApplications(userId) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs:job_id (
        id,
        user_id,
        title,
        description,
        category,
        district,
        status,
        price
      )
    `)
    .eq('contractor_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}