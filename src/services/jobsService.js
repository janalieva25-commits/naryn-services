import { supabase } from '../lib/supabase'

export async function getJobs(filters = {}) {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      public_profiles:user_id (
        id,
        full_name,
        role,
        avatar_url,
        rating,
        district,
        phone
      )
    `)
    .eq('status', 'open')

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  if (filters.district && filters.district !== 'all') {
    query = query.eq('district', filters.district)
  }

  if (filters.search && filters.search.trim()) {
    const safeSearch = filters.search.trim()
    query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`)
  }

  if (
    filters.minPrice !== '' &&
    filters.minPrice !== null &&
    filters.minPrice !== undefined
  ) {
    query = query.gte('price', Number(filters.minPrice))
  }

  if (
    filters.maxPrice !== '' &&
    filters.maxPrice !== null &&
    filters.maxPrice !== undefined
  ) {
    query = query.lte('price', Number(filters.maxPrice))
  }

  if (filters.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false })
  } else if (filters.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error

  let result = data || []

  if (filters.sortBy === 'rating_desc') {
    result = [...result].sort(
      (a, b) => Number(b.public_profiles?.rating || 0) - Number(a.public_profiles?.rating || 0)
    )
  }

  if (filters.sortBy === 'rating_asc') {
    result = [...result].sort(
      (a, b) => Number(a.public_profiles?.rating || 0) - Number(b.public_profiles?.rating || 0)
    )
  }

  return result
}

export async function getMyJobs(userId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      public_profiles:user_id (
        id,
        full_name,
        role,
        avatar_url,
        rating,
        district,
        phone
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getJobById(jobId) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      public_profiles:user_id (
        id,
        full_name,
        avatar_url,
        rating,
        phone,
        district,
        role
      )
    `)
    .eq('id', jobId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createJob(payload) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateJob(jobId, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteJob(jobId) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) throw error
}