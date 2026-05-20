import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function FilesSection({
  userId,
  images = [],
  documents = [],
  onImagesChange,
  onDocumentsChange,
}) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const uploadFile = async (file, bucket, setUploading, onChange, folderName) => {
    if (!file || !userId) return

    try {
      setUploading(true)

      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filePath = `${userId}/${folderName}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      const newItem = {
        name: file.name,
        path: filePath,
        url: data.publicUrl,
      }

      onChange([...images, newItem])
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    uploadFile(file, 'images', setUploadingImage, onImagesChange, 'images')
    e.target.value = ''
  }

  const handleDocumentUpload = (e) => {
    const file = e.target.files?.[0]
    uploadFile(file, 'documents', setUploadingDocument, onDocumentsChange, 'documents')
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="details-section">
        <h2>Фотографии</h2>

        <input
          type="file"
          accept="image/*"
          disabled={uploadingImage || !userId}
          onChange={handleImageUpload}
        />

        <div className="mt-3 space-y-2">
          {images.length === 0 ? (
            <p>Фотографии не добавлены</p>
          ) : (
            <div className="images-grid">
              {images.map((img) => (
                <a key={img.path} href={img.url} target="_blank" rel="noopener noreferrer">
                  {img.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="details-section">
        <h2>Документы</h2>

        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          disabled={uploadingDocument || !userId}
          onChange={handleDocumentUpload}
        />

        <div className="mt-3 space-y-2">
          {documents.length === 0 ? (
            <p>Документы не добавлены</p>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <a key={doc.path} href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}