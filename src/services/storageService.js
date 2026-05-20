import { supabase } from '../lib/supabase'

function getFileExt(fileName) {
  return fileName.split('.').pop()
}

function buildFilePath(userId, file) {
  const ext = getFileExt(file.name)
  return `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
}

export async function uploadImages(files, userId) {
  if (!files || files.length === 0) return []

  const uploadedUrls = []

  for (const file of files) {
    const filePath = buildFilePath(userId, file)

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    uploadedUrls.push(publicUrlData.publicUrl)
  }

  return uploadedUrls
}

export async function uploadDocuments(files, userId) {
  if (!files || files.length === 0) return []

  const uploadedPaths = []

  for (const file of files) {
    const filePath = buildFilePath(userId, file)

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    uploadedPaths.push(data.path)
  }

  return uploadedPaths
}

export async function createSignedDocumentUrl(path) {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60 * 10)

  if (error) throw error
  return data.signedUrl
}

export async function deleteStorageFiles(bucket, paths = []) {
  if (!paths || paths.length === 0) return []

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) throw error
  return data
}

export function extractStoragePathFromUrl(url, bucketName) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const marker = `/storage/v1/object/public/${bucketName}/`
    const idx = parsed.pathname.indexOf(marker)

    if (idx !== -1) {
      return parsed.pathname.split(marker)[1]
    }

    return null
  } catch {
    return null
  }
}